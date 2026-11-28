// PostToolUse hook（Edit / Write）。変えたファイルだけに eslint を当て、error があれば exit 2 でエージェントに返す。
// warn は返さない（eslint.config.mjs の既知の違反を、触るたびに返さないため）
import { existsSync } from "node:fs";

const LINTABLE = /\.(js|jsx|ts|tsx|mjs|cjs)$/;

const input = await Bun.stdin.json();
const filePath: unknown = input?.tool_input?.file_path;

if (typeof filePath !== "string" || !LINTABLE.test(filePath) || !existsSync(filePath)) {
  process.exit(0);
}

const result = Bun.spawnSync(["bunx", "eslint", "--quiet", "--no-warn-ignored", filePath], {
  cwd: process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
});

if (result.exitCode !== 0) {
  process.stderr.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(2);
}
