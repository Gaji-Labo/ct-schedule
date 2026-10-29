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
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
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
