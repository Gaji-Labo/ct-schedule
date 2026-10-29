"""Harness² の BenchmarkAdapter: ct-schedule のデザインシステムで、要件ファイルから画面の Story を作る。

rollout ごとに、ct-schedule の `base_commit` を git の履歴なしで書き出したワークスペースを作る
（experiments/setup.sh と同じ考え方。履歴や他ブランチから正解を読ませない）。リポジトリの
CLAUDE.md / .claude/skills は外し、検証するハーネス（AGENTS.md と .agents/skills）だけを置いて
`codex exec --json` で依頼を実行する。成果物は `git diff` と、Skill implement-ui の report.json。
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

from harness2.core import runmark as RM
from harness2.core import tree as harness_tree
from harness2.core.spec import BenchPrompts, BenchSpec, ChannelSpec
from harness2.substrate.base import Install, RunRequest
from harness2.substrate.codex import CODEX_ROOT_ENTRIES, CodexSubstrate

HERE = Path(__file__).resolve().parent
TASKS = HERE.parent / "tasks"
REPO = Path(os.environ.get("CTDS_REPO", HERE.parents[2]))


def _main_checkout(repo: Path) -> Path:
    """git worktree から実行しても、node_modules がある本体のチェックアウトを返す。"""
    r = subprocess.run(["git", "rev-parse", "--path-format=absolute", "--git-common-dir"],
                       cwd=repo, text=True, capture_output=True)
    return Path(r.stdout.strip()).parent if r.returncode == 0 else repo


NODE_MODULES = Path(os.environ.get("CTDS_NODE_MODULES", _main_checkout(REPO) / "node_modules"))
RUNS = Path(os.environ.get("CTDS_RUNS", Path.home() / "ct-schedule-experiments/harness2"))
# rollout の起点。タスクの meta.json に base_commit があればそちらを使う
BASE_COMMIT = os.environ.get("CTDS_BASE_COMMIT", "feature/screen-brief-skill")

CODEX_BIN = Path(
    os.environ.get(
        "CTDS_CODEX_BIN",
        Path.home() / "Work/30_tsukulink/harness2/runs/tsuk/codex-npm/node_modules/.bin/codex",
    )
)
CODEX_HOME = Path(os.environ.get("CTDS_CODEX_HOME", RUNS / "codex_home"))
SOLVER_MODEL = os.environ.get("CTDS_SOLVER_MODEL", "gpt-6.1-sol")
SOLVER_EFFORT = os.environ.get("CTDS_SOLVER_EFFORT", "medium")
IMPROVER_MODEL = os.environ.get("CTDS_IMPROVER_MODEL", "claude-opus-5-5")
IMPROVER_EFFORT = os.environ.get("CTDS_IMPROVER_EFFORT", "high")
ROLLOUT_TIMEOUT = int(os.environ.get("CTDS_ROLLOUT_TIMEOUT", "1800"))
KEEP_WS = os.environ.get("CTDS_KEEP_WS", "") == "1"

# ワークスペースに持ち込まないもの。リポジトリのハーネス（CLAUDE.md / Skill）は検証対象のハーネスに
# 置き換えるので外す。implement-ui の report.ts だけは `bun run report:ui` が使うので残す
DROP = ("CLAUDE.md", "AGENTS.md", ".claude", "experiments", ".github")
KEEP_FROM_CLAUDE = (".claude/skills/implement-ui/report.ts",)
# 成果物の diff に入れないもの（ハーネスと足場）
EXCLUDE = (*CODEX_ROOT_ENTRIES, "sub_agents", "node_modules", "storybook-static", ".implement-ui",
           ".codex_last.md", ".claude")

PROMPTS = BenchPrompts(
    work=(
        "build one screen of an in-house web app as Storybook stories, using the repository's "
        "design system (tokens, shadcn/ui-based components, layout primitives) and the screen's "
        "requirement file, so that a designer reviewing Storybook sees the screen they intended"
    ),
    domain_word="app",
    deliverable_word="diff",
    yardstick=(
        "the draft a careful designer-engineer on this team would put up for review: every "
        "requirement and state in the requirement file is visible as a story, the screen is "
        "composed only from existing components and tokens (no ad-hoc cards, palette colours or "
        "arbitrary values), the most important information is what the eye lands on first, "
        "nothing is shown twice, rows and cards of the same kind line up, irreversible actions "
        "are confirmed, and lint / Storybook build pass with no horizontal overflow at 375px "
        "and 1280px"
    ),
    domain_guidance=(
        "The design rules live in docs/design/ (rules.md, principles.md, apps/<app>.md and the "
        "per-screen requirement files under apps/<app>/screens/); component usage lives in each "
        "component's stories and src/design-system/guidelines/*.mdx. Those files are fixed: "
        "lessons belong in AGENTS.md and the implement-ui skill."
    ),
)


def ctds_spec() -> BenchSpec:
    channel = ChannelSpec("claude_cli", IMPROVER_MODEL, effort=IMPROVER_EFFORT)
    return BenchSpec(
        name="ctds",
        runs_root=RUNS,
        install_mode="codex_root",
        prompts=PROMPTS,
        channels={"proposer": channel, "selector": channel},
        domain_word="app",
        leak_globs=("rubric.md", "meta.json", "answer/*"),
        allow_subagents=False,
        proposer_deliverables="contents",
        obs_trunc=50_000,
    )


def _run(cmd, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, text=True, capture_output=True, **kw)


# codex の利用上限。この rollout はハーネスの良し悪しと関係なく失敗するので、済みにせず止める
QUOTA_MARKERS = ("spend cap", "usage limit")


def _quota_error(run_dir: Path) -> str | None:
    stream = run_dir / "codex_session.jsonl"
    if not stream.is_file():
        return None
    for line in stream.read_text(encoding="utf-8").splitlines():
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            continue
        if ev.get("type") not in ("error", "turn.failed"):
            continue
        msg = ev.get("message") or (ev.get("error") or {}).get("message") or ""
        if any(m in msg.lower() for m in QUOTA_MARKERS):
            return msg
    return None


def _git_show(commit: str, path: str) -> str:
    r = _run(["git", "show", f"{commit}:{path}"], cwd=REPO)
    if r.returncode:
        raise RuntimeError(f"git show {commit}:{path} failed: {r.stderr[-300:]}")
    return r.stdout


def resolve_commit(ref: str) -> str:
    r = _run(["git", "rev-parse", "--short=10", f"{ref}^{{commit}}"], cwd=REPO)
    if r.returncode:
        raise RuntimeError(f"unknown commit {ref!r} in {REPO}")
    return r.stdout.strip()


def build_base_harness(commit: str, dest: Path) -> Path:
    """リポジトリの CLAUDE.md と .claude/skills を、codex のハーネス（AGENTS.md と .agents/skills）に写す。

    Claude Code 向けの書き方（`/implement-ui` での呼び出し、.claude/skills のパス）だけを置き換え、
    中身は変えない。改善ループはこの写しを起点に AGENTS.md と SKILL.md を編集する。
    """
    agents = _git_show(commit, "CLAUDE.md").replace(".claude/skills/", ".agents/skills/")
    agents = agents.replace("# CLAUDE.md", "# AGENTS.md", 1)
    skills = {}
    for name in ("implement-ui", "screen-brief", "reflect-decisions"):
        body = _git_show(commit, f".claude/skills/{name}/SKILL.md")
        body = body.replace(".claude/skills/", ".agents/skills/")
        # report.ts は .claude/skills/implement-ui/ に残してあるので、スクリプトの呼び出しは変えない
        body = body.replace(".agents/skills/implement-ui/report.ts", ".claude/skills/implement-ui/report.ts")
        skills[f".agents/skills/{name}/SKILL.md"] = body
    agents += (
        "\n## Skills\n\n"
        "- When building or changing a screen, component or Story (any UI request, even a rough "
        "one), read .agents/skills/implement-ui/SKILL.md and follow it.\n"
        "- When gathering a screen's requirements before building it, read "
        ".agents/skills/screen-brief/SKILL.md and follow it.\n"
        "- When writing back decisions made during review, read "
        ".agents/skills/reflect-decisions/SKILL.md and follow it.\n"
    )
    surface = CodexSubstrate().surface()
    harness_tree.write_tree(surface, {"AGENTS.md": agents, **skills}, dest, stubs=True)
    return dest


class CtdsAdapter:
    def __init__(self, *, timeout: int = ROLLOUT_TIMEOUT):
        self.spec = ctds_spec()
        self.substrate = CodexSubstrate(launcher=self._launch)
        self.timeout = timeout
        self.execution_count = 0
        self.default_commit = resolve_commit(BASE_COMMIT)
        self._base = RUNS / "base_harness" / self.default_commit
        if not (self._base / "AGENTS.md").is_file():
            build_base_harness(self.default_commit, self._base)

    # ---- タスク ---------------------------------------------------------------------

    def tasks(self, split: str = "all") -> list[str]:
        return sorted(p.name for p in TASKS.iterdir() if (p / "task.md").is_file())

    def meta(self, task_id: str) -> dict:
        return json.loads((TASKS / task_id / "meta.json").read_text(encoding="utf-8"))

    def commit_of(self, task_id: str) -> str:
        ref = self.meta(task_id).get("base_commit")
        return resolve_commit(ref) if ref else self.default_commit

    def domain_of(self, task_id: str) -> str:
        return self.meta(task_id)["domain"]

    def task_prompt(self, task_id: str) -> str:
        return (TASKS / task_id / "task.md").read_text(encoding="utf-8")

    def task_files(self, task_id: str) -> Path:
        return TASKS / task_id

    # ---- ハーネス -------------------------------------------------------------------

    def base_harness(self) -> Path:
        return self._base

    def validate_tree(self, harness: harness_tree.Tree) -> None:
        if not str(harness.get("AGENTS.md", "")).strip():
            raise ValueError("AGENTS.md must not be empty")

    # ---- 実行 -----------------------------------------------------------------------

    def _run_dir(self, run_id: str) -> Path:
        return RUNS / "executions" / run_id

    def _ws_dir(self, run_id: str) -> Path:
        return RUNS / "workspaces" / run_id.replace("/", "__")

    def execute(
        self, task_id: str, harness_dir: Path | None, run_id: str, *, timeout: int | None = None
    ) -> Path:
        out = self._run_dir(run_id)
        if (
            RM.is_complete(out, harness_dir=harness_dir)
            and (out / "codex_session.jsonl").is_file()
            and not _quota_error(out)
        ):
            return out
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)
        self.execution_count += 1
        install = self._install(harness_dir)
        try:
            self.substrate.execute(task_id, install, [run_id], int(timeout or self.timeout))
        finally:
            if install.extras.get("harness") == "staged":
                shutil.rmtree(install.staging_dir, ignore_errors=True)
        if not (out / "codex_session.jsonl").is_file():
            raise RuntimeError(f"codex produced no session stream in {out}")
        if quota := _quota_error(out):
            raise RuntimeError(f"codex quota exhausted ({run_id}): {quota}")
        RM.mark_complete(out, run_id=run_id, harness_dir=harness_dir)
        return out

    def _install(self, harness_dir: Path | None) -> Install:
        if harness_dir is None:
            return Install(staging_dir=self._base, fingerprint="base", extras={"harness": "base"})
        inst = self.substrate.materialise(Path(harness_dir), self.spec, {})
        return Install(
            staging_dir=inst.staging_dir,
            fingerprint=inst.fingerprint,
            extras={**inst.extras, "harness": "staged"},
        )

    def make_workspace(self, task_id: str, ws: Path) -> Path:
        """base_commit を履歴なしで書き出し、タスクの setup/ を重ね、node_modules をつなぐ。"""
        commit = self.commit_of(task_id)
        meta = self.meta(task_id)
        if ws.exists():
            shutil.rmtree(ws)
        ws.mkdir(parents=True)
        archive = subprocess.run(["git", "archive", commit], cwd=REPO, capture_output=True)
        if archive.returncode:
            raise RuntimeError(f"git archive {commit} failed: {archive.stderr[-300:]!r}")
        r = subprocess.run(["tar", "-x", "-C", str(ws)], input=archive.stdout, capture_output=True)
        if r.returncode:
            raise RuntimeError(f"tar failed: {r.stderr[-300:]!r}")
        kept = {rel: (ws / rel).read_bytes() for rel in KEEP_FROM_CLAUDE if (ws / rel).is_file()}
        for entry in DROP:
            p = ws / entry
            if p.is_dir():
                shutil.rmtree(p)
            elif p.exists():
                p.unlink()
        for rel, data in kept.items():
            (ws / rel).parent.mkdir(parents=True, exist_ok=True)
            (ws / rel).write_bytes(data)
        # 確認待ちの画面（drafts/）は README 以外持ち込まない。reproduce の正解は meta の hide で消す
        drafts = ws / "src/design-system/drafts"
        if drafts.is_dir():
            for f in drafts.rglob("*"):
                if f.is_file() and f.name != "README.md":
                    f.unlink()
        for rel in meta.get("hide", []):
            p = ws / rel
            if p.is_dir():
                shutil.rmtree(p)
            elif p.exists():
                p.unlink()
        setup = TASKS / task_id / "setup"
        if setup.is_dir():
            shutil.copytree(setup, ws, dirs_exist_ok=True)
        _run(["git", "init", "-q"], cwd=ws)
        _run(["git", "add", "-A"], cwd=ws)
        _run(["git", "-c", "user.name=experiment", "-c", "user.email=experiment@localhost",
              "commit", "-q", "--no-verify", "-m", f"実験の初期状態 ({task_id})"], cwd=ws)
        # node_modules は本体のものを1つずつリンクする。vite / storybook は node_modules/.vite や
        # .cache に書くので、ディレクトリ自体は実体にしてワークスペース内に書かせる
        local_nm = ws / "node_modules"
        local_nm.mkdir()
        for entry in NODE_MODULES.iterdir():
            if not entry.name.startswith((".vite", ".cache")):
                os.symlink(entry, local_nm / entry.name)
        exclude = ws / ".git" / "info" / "exclude"
        exclude.write_text("".join(f"/{e}\n" for e in EXCLUDE), encoding="utf-8")
        return ws

    def _launch(self, req: RunRequest, install: Install) -> list[Path]:
        dirs = []
        for run_id in req.run_ids:
            out = self._run_dir(run_id)
            ws = self.make_workspace(req.task_ref, self._ws_dir(run_id))
            for entry in CODEX_ROOT_ENTRIES:
                src = install.staging_dir / entry
                if not src.exists():
                    continue
                dst = ws / entry
                if src.is_dir():
                    shutil.copytree(src, dst, dirs_exist_ok=True)
                else:
                    shutil.copy2(src, dst)
            cmd = [
                str(CODEX_BIN),
                "exec",
                self.task_prompt(req.task_ref),
                "--model",
                SOLVER_MODEL,
                "-c",
                f'model_reasoning_effort="{SOLVER_EFFORT}"',
                "--sandbox",
                "workspace-write",
                # Storybook ビルドが next/font で Google Fonts を取りに行くので、ネットワークは許す
                "-c",
                "sandbox_workspace_write.network_access=true",
                "--add-dir",
                str(NODE_MODULES.resolve()),
                "--skip-git-repo-check",
                "--dangerously-bypass-hook-trust",
                "--ephemeral",
                "--json",
                "-C",
                str(ws),
                "-o",
                str(ws / ".codex_last.md"),
            ]
            env = {k: v for k, v in os.environ.items() if k != "OPENAI_BASE_URL"}
            env["CODEX_HOME"] = str(CODEX_HOME)
            env["STORYBOOK_DISABLE_TELEMETRY"] = "1"
            stream = out / "codex_session.jsonl"
            timed_out = False
            with stream.open("w", encoding="utf-8") as fh, (out / "codex_stderr.log").open(
                "w", encoding="utf-8"
            ) as eh:
                try:
                    subprocess.run(
                        cmd, cwd=ws, env=env, stdin=subprocess.DEVNULL, stdout=fh, stderr=eh,
                        timeout=req.timeout,
                    )
                except subprocess.TimeoutExpired:
                    timed_out = True
            harness_files = sorted(
                str(f.relative_to(install.staging_dir))
                for f in install.staging_dir.rglob("*")
                if f.is_file()
            )
            self._harvest(ws, out, timed_out, harness_files)
            if not KEEP_WS:
                shutil.rmtree(ws, ignore_errors=True)
            dirs.append(out)
        return dirs

    def _harvest(self, ws: Path, out: Path, timed_out: bool, harness_files: list[str]) -> None:
        """成果物はエージェントの変更だけ。ハーネスのファイルと足場は pathspec で外す。"""
        _run(["git", "add", "-A"], cwd=ws)
        excludes = [f":(exclude){e}" for e in EXCLUDE]
        excludes += [f":(exclude){f}" for f in harness_files]
        diff = _run(["git", "diff", "--cached", "--no-color", "--", ".", *excludes], cwd=ws).stdout
        status = _run(["git", "status", "--porcelain", "--", ".", *excludes], cwd=ws).stdout
        (out / "harness_files.json").write_text(json.dumps(harness_files), encoding="utf-8")
        (out / "diff.patch").write_text(diff, encoding="utf-8")
        (out / "status.txt").write_text(status, encoding="utf-8")
        last = ws / ".codex_last.md"
        (out / "final.md").write_text(
            last.read_text(encoding="utf-8") if last.is_file() else "", encoding="utf-8"
        )
        report = ws / ".implement-ui" / "report.json"
        if report.is_file():
            shutil.copy2(report, out / "report.json")
        (out / "run.json").write_text(
            json.dumps({"timed_out": timed_out, "model": SOLVER_MODEL, "effort": SOLVER_EFFORT}),
            encoding="utf-8",
        )

    # ---- 改善側に渡す材料 -----------------------------------------------------------

    def delivered(self, run_dir: Path) -> bool:
        p = Path(run_dir) / "diff.patch"
        return p.is_file() and bool(p.read_text(encoding="utf-8").strip())

    def trajectory(self, run_dir: Path, *, obs_trunc: int) -> str:
        stream = Path(run_dir) / "codex_session.jsonl"
        if not stream.is_file():
            return f"(no trajectory recorded for {Path(run_dir).name})"
        return self.substrate.read_trajectory(stream, obs_trunc=obs_trunc, max_chars=10**9)

    def deliverable_files(self, run_dir: Path) -> dict[str, str]:
        files = {}
        for name in ("diff.patch", "final.md", "report.json"):
            p = Path(run_dir) / name
            if p.is_file() and p.read_text(encoding="utf-8").strip():
                files[name] = p.read_text(encoding="utf-8")
        return files

    def deliverable_text(self, run_dir: Path) -> str:
        return "\n\n".join(f"## {k}\n\n{v}" for k, v in self.deliverable_files(run_dir).items())
