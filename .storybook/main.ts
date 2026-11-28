import type { StorybookConfig } from "@storybook/nextjs-vite";
import { execSync } from "node:child_process";
import remarkGfm from "remark-gfm";

// GitHub へのリンク先にするブランチ (src/design-system/repo.ts)。
// Cloudflare Workers Builds では WORKERS_CI_BRANCH、手元では今のブランチ。取れなければ main
const gitBranch = (() => {
  if (process.env.WORKERS_CI_BRANCH) return process.env.WORKERS_CI_BRANCH;
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
    return branch && branch !== "HEAD" ? branch : "main";
  } catch {
    return "main";
  }
})();

const isScreenStoryFile = (fileName: string) =>
  /\/src\/design-system\/(pages|drafts)\//.test(fileName);

const config: StorybookConfig = {
  stories: [
    "../src/design-system/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        // MDX で表 (GFM テーブル) を使えるようにする
        mdxPluginOptions: {
          mdxCompileOptions: { remarkPlugins: [remarkGfm] },
        },
      },
    },
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    // Story をテストとして回す（bun run test:stories、vitest.config.mts）
    "@storybook/addon-vitest",
    // 起動中の Storybook に MCP サーバーを立てる（http://localhost:6006/mcp、.mcp.json で登録）。
    // AI が部品の一覧と Props を引く。部品の情報は下の features.componentsManifest のマニフェストから読む
    {
      name: "@storybook/addon-mcp",
      options: {
        // 部品を引く docs だけを使う。dev（Story の書き方・プレビュー）と test（test-run）は、
        // Skill implement-ui と bun run verify:ui の手順とぶつかる指示をエージェントに出すので切る
        toolsets: { dev: false, test: false },
      },
    },
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  // 画面の Story（pages/・drafts/）は使い回す部品ではないので、部品のマニフェストに載せない。
  // ファイルの場所で一律に !manifest タグを付ける（Story ファイルに書かなくてよい）
  experimental_indexers: (indexers) =>
    (indexers ?? []).map((indexer) => ({
      ...indexer,
      createIndex: async (fileName, options) => {
        const inputs = await indexer.createIndex(fileName, options);
        if (!isScreenStoryFile(fileName)) return inputs;
        return inputs.map((input) => ({ ...input, tags: [...(input.tags ?? []), "!manifest"] }));
      },
    })),
  features: {
    // 部品の一覧と Props を /manifests/components.json に出す（ビルドでは manifests/ に出力）。
    // AI が部品の仕様を引くために使う。画面の Story は上の experimental_indexers で外す
    componentsManifest: true,
  },
  staticDirs: ["../public"],
  viteFinal: (config) => ({
    ...config,
    define: {
      ...config.define,
      "process.env.STORYBOOK_GIT_BRANCH": JSON.stringify(gitBranch),
    },
  }),
};

export default config;
