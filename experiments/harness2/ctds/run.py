"""ct-schedule の画面づくりのタスクで Harness² の改善ループを回す。

    experiments/harness2/h2 run --task mypage --k 1 --mode parallel [--dry-run]
    experiments/harness2/h2 run --task mypage,holidays --tag sweep1 --judge

同じ domain のタスクは1つのライブラリを共有するので、先のタスクの教訓が後のタスクの改善に届く。
--judge を付けると、domain が終わるたびに各タスクを採点する。
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys

from harness2.core.proposer import Proposer
from harness2.core.schedule import mode_token, run_domain

from . import adapter as A
from . import judge
from .adapter import CtdsAdapter


def preflight(ad: CtdsAdapter, tasks: list[str]) -> list[str]:
    problems = []
    if not A.CODEX_BIN.is_file():
        problems.append(f"codex binary missing: {A.CODEX_BIN}")
    if not (A.CODEX_HOME / "auth.json").is_file():
        problems.append(
            f"codex auth missing: {A.CODEX_HOME}/auth.json "
            f"(mkdir -p {A.CODEX_HOME} && cp ~/.codex/auth.json {A.CODEX_HOME}/)"
        )
    if not shutil.which("claude"):
        problems.append("claude CLI not on PATH")
    if not A.NODE_MODULES.is_dir():
        problems.append(f"node_modules missing: {A.NODE_MODULES} (bun install in the main checkout)")
    unknown = [t for t in tasks if t not in ad.tasks()]
    if unknown:
        problems.append(f"unknown task(s) {unknown}; have {ad.tasks()}")
    return problems


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--task", required=True, help="comma separated task ids")
    ap.add_argument("--k", type=int, default=1)
    ap.add_argument("--mode", choices=("parallel", "sequential"), default="parallel")
    ap.add_argument("--tag", default="")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--judge", action="store_true", help="grade each task after its domain finishes")
    args = ap.parse_args(argv)

    ad = CtdsAdapter()
    tasks = [t for t in args.task.split(",") if t]
    problems = preflight(ad, tasks)
    by_domain: dict[str, list[str]] = {}
    for t in tasks:
        if t in ad.tasks():
            by_domain.setdefault(ad.domain_of(t), []).append(t)
    print(f"tasks={tasks} k={args.k} mode={args.mode} tag={args.tag or '-'}")
    for d, ts in by_domain.items():
        print(f"  {d}: " + ", ".join(f"{t}@{ad.commit_of(t)}" for t in ts))
    print(f"repo    : {A.REPO} (node_modules: {A.NODE_MODULES})")
    print(f"base    : {ad.base_harness()}")
    print(f"solver  : codex {A.SOLVER_MODEL} (effort {A.SOLVER_EFFORT}) via {A.CODEX_BIN}")
    print(f"improver: claude -p {A.IMPROVER_MODEL} (effort {A.IMPROVER_EFFORT})")
    print(f"runs    : {A.RUNS}")
    for p in problems:
        print(f"  !! {p}")
    if args.dry_run:
        return int(bool(problems))
    if problems:
        return 1

    # project="" で、シェルに GOOGLE_CLOUD_PROJECT があっても Vertex ではなく手元の Claude Code の
    # ログインで改善側を動かす（harness2/core/proposer.py のパッチが前提）
    prop = Proposer(ad.spec.channels["proposer"], audit_dir=A.RUNS / "audit", project="")
    mode = mode_token(args.mode)
    failed = 0
    for domain, ts in by_domain.items():
        result = run_domain(
            domain,
            ts,
            args.k,
            adapter=ad,
            prop=prop,
            runs_root=ad.spec.runs_root,
            # タグごとにライブラリを分ける。同じタスクを前に回したときの教訓（答えを含みうる）を混ぜない
            library_root=A.RUNS / "library" / (f"k{args.k}" + (f"-{args.tag}" if args.tag else "")),
            modes=(mode,),
            tag=args.tag,
        )
        result["execution_count"] = ad.execution_count
        result["editor_calls"] = len(prop._calls)
        result["editor_cost_usd"] = round(sum(r.cost_usd for r in prop._calls), 4)
        name = ts[0] if len(ts) == 1 else f"{domain}-{args.tag or 'multi'}"
        report = A.RUNS / f"result-{name}-k{args.k}-{mode}.json"
        report.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(json.dumps({k: result[k] for k in ("domain", "done", "failed", "editor_cost_usd")}))
        failed += result["failed"]
        if args.judge:
            for t in ts:
                judge.main(["--task", t, "--k", str(args.k), "--mode", args.mode]
                           + (["--tag", args.tag] if args.tag else []))
    return int(failed > 0)


if __name__ == "__main__":
    sys.exit(main())
