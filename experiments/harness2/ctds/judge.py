"""1つのタスクの全 rollout を採点する。改善側には見せない（人がハーネスを比べるためのもの）。

    experiments/harness2/h2 judge --task mypage --k 1 --mode parallel [--no-rubric] [--only base1]

rollout ごとに次を行い、`judge.json` と、タスク単位の `judge.md`（比較表）を書く。

1. 機械的な検査: diff を新しいワークスペースに当て、変更したファイルの eslint（design-system/* ルール）、
   tsc、Storybook の静的ビルド
2. 画面: ビルドした Storybook から、変更したファイルの Story を 1280px と 375px で撮り、横へのはみ出しを調べる
3. ルーブリック: タスクの rubric.md（デザイナーの意図）を、スクリーンショットと diff を見て claude -p が判定する
"""

from __future__ import annotations

import argparse
import functools
import http.server
import json
import os
import re
import shutil
import subprocess
import sys
import threading
from pathlib import Path

from harness2.core.schedule import mode_token

from . import adapter as A
from .adapter import CtdsAdapter, _run

JUDGE_MODEL = A.IMPROVER_MODEL
MAX_STORIES = 12
OVERFLOW_JS = "document.documentElement.scrollWidth > window.innerWidth"


def _changed_files(patch: str) -> list[str]:
    return sorted(set(re.findall(r"^\+\+\+ b/(\S+)$", patch, re.M)))


def mechanical(ad: CtdsAdapter, task: str, run_dir: Path, sb_out: Path) -> dict:
    patch = run_dir / "diff.patch"
    res: dict = {"applied": False, "lint": None, "typecheck": None, "storybook": None}
    if not patch.is_file() or not patch.read_text().strip():
        return res
    ws = ad.make_workspace(task, A.RUNS / "judge-ws" / f"{task}-{run_dir.parent.name}-{run_dir.name}")
    try:
        r = _run(["git", "apply", "--index", str(patch)], cwd=ws)
        res["applied"] = r.returncode == 0
        if not res["applied"]:
            res["apply_error"] = r.stderr[-400:]
            return res
        changed = _changed_files(patch.read_text())
        res["changed"] = changed
        targets = [f for f in changed if f.endswith((".ts", ".tsx", ".mjs")) and (ws / f).is_file()]
        if targets:
            r = _run([str(ws / "node_modules/.bin/eslint"), "--format", "json", *targets], cwd=ws)
            try:
                report = json.loads(r.stdout)
                msgs = [
                    {"file": f["filePath"].replace(str(ws) + "/", ""), "rule": m.get("ruleId"),
                     "severity": m["severity"], "line": m.get("line"), "message": m["message"][:200]}
                    for f in report for m in f["messages"]
                ]
                res["lint"] = {
                    "errors": sum(1 for m in msgs if m["severity"] == 2),
                    "warnings": sum(1 for m in msgs if m["severity"] == 1),
                    "messages": msgs[:40],
                }
            except json.JSONDecodeError:
                res["lint"] = {"errors": None, "warnings": None, "raw": (r.stdout + r.stderr)[-600:]}
        r = _run([str(ws / "node_modules/.bin/tsc"), "--noEmit", "-p", "."], cwd=ws, timeout=900)
        res["typecheck"] = {"ok": r.returncode == 0, "tail": (r.stdout + r.stderr)[-800:]}
        if sb_out.exists():
            shutil.rmtree(sb_out)
        r = _run([str(ws / "node_modules/.bin/storybook"), "build", "--quiet", "-o", str(sb_out)],
                 cwd=ws, timeout=900, env={**os.environ, "STORYBOOK_DISABLE_TELEMETRY": "1"})
        res["storybook"] = {"ok": r.returncode == 0, "tail": (r.stdout + r.stderr)[-800:]}
    finally:
        shutil.rmtree(ws, ignore_errors=True)
    return res


def new_stories(sb_out: Path, changed: list[str]) -> list[dict]:
    index = sb_out / "index.json"
    if not index.is_file():
        return []
    entries = json.loads(index.read_text())["entries"].values()
    wanted = {"./" + f for f in changed if f.endswith(".stories.tsx")}
    found = [
        {"id": e["id"], "title": e["title"], "name": e["name"], "file": e["importPath"][2:]}
        for e in entries
        if e.get("type") == "story" and e.get("importPath") in wanted
    ]
    # 採点の主役は画面の Story（drafts/）なので全部撮る。部品の Story は残りの枠で撮る
    pages = [s for s in found if s["file"].startswith("src/design-system/drafts/")]
    others = [s for s in found if s not in pages]
    return pages + others[: max(0, MAX_STORIES - len(pages))]


def screenshots(sb_out: Path, stories: list[dict], shots: Path) -> list[dict]:
    """静的ビルドを手元で配信し、各 Story を 1280px と 375px で撮る。はみ出しも同時に調べる。"""
    from playwright.sync_api import sync_playwright

    if shots.exists():
        shutil.rmtree(shots)
    shots.mkdir(parents=True)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args) -> None:
            pass

    handler = functools.partial(Quiet, directory=str(sb_out))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    out = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for s in stories:
                row = {**s, "overflow": {}, "errors": []}
                for width, height in ((1280, 800), (375, 812)):
                    page = browser.new_page(viewport={"width": width, "height": height})
                    page.on("pageerror", lambda e, row=row: row["errors"].append(str(e)[:200]))
                    page.goto(f"{base}/iframe.html?id={s['id']}&viewMode=story", wait_until="networkidle")
                    page.wait_for_timeout(600)
                    row["overflow"][str(width)] = page.evaluate(OVERFLOW_JS)
                    path = shots / f"{s['id']}-{width}.png"
                    page.screenshot(path=str(path), full_page=True)
                    row[f"shot_{width}"] = str(path)
                    page.close()
                out.append(row)
            browser.close()
    finally:
        server.shutdown()
    return out


def rubric(task: str, run_dir: Path, shots: list[dict]) -> dict:
    rub = (A.TASKS / task / "rubric.md").read_text(encoding="utf-8")
    req = "\n\n".join(
        f"### {f.relative_to(A.TASKS / task / 'setup')}\n\n{f.read_text(encoding='utf-8')}"
        for f in sorted((A.TASKS / task / "setup").rglob("*.md"))
    ) if (A.TASKS / task / "setup").is_dir() else ""
    patch = run_dir / "diff.patch"
    diff = patch.read_text(encoding="utf-8") if patch.is_file() else ""
    if not diff.strip():
        return {"items": [], "passed": 0, "total": 0, "note": "no diff"}
    shot_lines = "\n".join(
        f"- {s['title']} / {s['name']} (overflow 1280={s['overflow'].get('1280')}, "
        f"375={s['overflow'].get('375')}): {s.get('shot_1280')} , {s.get('shot_375')}"
        for s in shots
    ) or "(no stories were rendered)"
    prompt = (
        "あなたは社内アプリのデザインシステムのレビュアー（デザイナー）です。AI が作った画面の Story を、"
        "ルーブリックの各項目について pass / fail で判定します。見た目に関わる項目は、必ず下の"
        "スクリーンショット（PNG）を Read ツールで開いて確かめてください。コードだけで判断しないこと。"
        "画面の外の事情（ハーネス・生成過程）は考えません。\n\n"
        'ONLY a JSON object で答えてください: {"items":[{"id":1,"pass":true,"reason":"..."}, ...],'
        ' "overall":"デザイナーとしての一言（日本語）"}。reason は日本語で1行。\n\n'
        f"# ルーブリック\n\n{rub}\n\n# 要件ファイル\n\n{req[:20000]}\n\n"
        f"# スクリーンショット（Story ごとに 1280px と 375px、ページ全体）\n\n{shot_lines}\n\n"
        f"# diff\n\n```diff\n{diff[:60000]}\n```\n"
    )
    shots_dir = run_dir / "shots"
    r = subprocess.run(
        ["claude", "-p", "--output-format", "json", "--model", JUDGE_MODEL,
         "--allowedTools", "Read", "--add-dir", str(shots_dir)],
        input=prompt, text=True, capture_output=True, timeout=1200, cwd=run_dir,
    )
    try:
        text = json.loads(r.stdout).get("result") or ""
    except json.JSONDecodeError:
        text = r.stdout
    m = re.search(r"\{.*\}", text, re.S)
    try:
        data = json.loads(m.group(0)) if m else {"items": []}
    except json.JSONDecodeError:
        data = {"items": [], "raw": text[-800:]}
    items = data.get("items", [])
    return {"items": items, "passed": sum(1 for i in items if i.get("pass")), "total": len(items),
            "overall": data.get("overall", ""), **({"raw": data["raw"]} if "raw" in data else {})}


def _row_line(row: dict) -> str:
    lint = row.get("lint") or {}
    tc = row.get("typecheck") or {}
    sb = row.get("storybook") or {}
    shots = row.get("stories") or []
    over = sum(1 for s in shots for v in s["overflow"].values() if v)
    rub = row.get("rubric") or {}
    return (
        f"| {row['label']} | {'○' if row['applied'] else '×'} | {lint.get('errors', '-')}/{lint.get('warnings', '-')} "
        f"| {'○' if tc.get('ok') else '×'} | {'○' if sb.get('ok') else '×'} | {len(shots)} | {over} "
        f"| {rub.get('passed', '-')}/{rub.get('total', '-')} |"
    )


def write_markdown(task: str, adopted: str, rows: list[dict], dest: Path) -> None:
    lines = [
        f"# 採点: {task}", "", f"採用: `{adopted or '-'}`", "",
        "| ラベル | diff 適用 | lint 誤り/警告 | tsc | Storybook | Story 数 | はみ出し | ルーブリック |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
        *[_row_line(r) for r in rows], "",
    ]
    ids = sorted({i.get("id") for r in rows for i in (r.get("rubric") or {}).get("items", [])},
                 key=lambda x: (x is None, x))
    if ids:
        lines += ["## ルーブリックの項目別", "",
                  "| 項目 | " + " | ".join(r["label"] for r in rows) + " |",
                  "| --- | " + " | ".join("---" for _ in rows) + " |"]
        for i in ids:
            cells = []
            for r in rows:
                it = next((x for x in (r.get("rubric") or {}).get("items", []) if x.get("id") == i), None)
                cells.append("-" if it is None else ("○" if it.get("pass") else "×"))
            lines.append(f"| {i} | " + " | ".join(cells) + " |")
        lines.append("")
    for r in rows:
        rub = r.get("rubric") or {}
        lines += [f"## {r['label']}", "", rub.get("overall", ""), ""]
        for it in rub.get("items", []):
            lines.append(f"- {'○' if it.get('pass') else '×'} {it.get('id')}. {it.get('reason', '')}")
        for m in ((r.get("lint") or {}).get("messages") or [])[:10]:
            lines.append(f"- lint: `{m['file']}:{m['line']}` {m['rule']} — {m['message']}")
        lines.append("")
    dest.write_text("\n".join(lines), encoding="utf-8")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--task", required=True)
    ap.add_argument("--k", type=int, default=1)
    ap.add_argument("--mode", choices=("parallel", "sequential"), default="parallel")
    ap.add_argument("--tag", default="")
    ap.add_argument("--no-rubric", action="store_true")
    ap.add_argument("--only", default="", help="comma separated labels to (re)judge")
    ap.add_argument("--ns", default="", help="override the executions namespace (e.g. smoke)")
    args = ap.parse_args(argv)
    ad = CtdsAdapter()
    mode = mode_token(args.mode)
    ns = args.ns or f"ctds-cx-{mode}{args.k}" + (f"-{args.tag}" if args.tag else "")
    root = A.RUNS / "executions" / ns / args.task
    if not root.is_dir():
        print(f"no executions under {root}")
        return 1
    summary = A.RUNS / ns / args.task / "summary.json"
    adopted = ""
    if summary.is_file():
        s = json.loads(summary.read_text())
        adopted = json.dumps({m: v.get("adopted") for m, v in (s.get("modes") or {}).items()})
    only = {x for x in args.only.split(",") if x}
    rows = []
    for run_dir in sorted(p for p in root.iterdir() if p.is_dir()):
        cached = run_dir / "judge.json"
        if only and run_dir.name not in only:
            if cached.is_file():
                rows.append(json.loads(cached.read_text()))
            continue
        sb_out = A.RUNS / "judge-sb" / f"{ns}-{args.task}-{run_dir.name}"
        mech = mechanical(ad, args.task, run_dir, sb_out)
        stories = []
        if (mech.get("storybook") or {}).get("ok"):
            stories = screenshots(sb_out, new_stories(sb_out, mech.get("changed", [])), run_dir / "shots")
        rub = {} if args.no_rubric else rubric(args.task, run_dir, stories)
        row = {"label": run_dir.name, **mech, "stories": stories, "rubric": rub}
        cached.write_text(json.dumps(row, indent=2, ensure_ascii=False))
        rows.append(row)
        print(_row_line(row))
    out = A.RUNS / ns / args.task / "judge.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"adopted": adopted, "rows": rows}, indent=2, ensure_ascii=False))
    write_markdown(args.task, adopted, rows, out.with_suffix(".md"))
    print(f"adopted: {adopted or '(no summary.json)'}\n-> {out.with_suffix('.md')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
