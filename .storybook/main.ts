import type { StorybookConfig } from "@storybook/nextjs-vite";
import remarkGfm from "remark-gfm";

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
    // http://localhost:6006/mcp で AI エージェント向けの MCP サーバーを提供する
    "@storybook/addon-mcp",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  features: {
    // AI エージェント向けのマニフェスト (/manifests/components.json, docs.json) を生成する
    // addon-mcp も有効にするが、addon を外しても生成されるよう明示しておく
    componentsManifest: true,
    // props を TypeScript の型から抽出する。react-docgen では cva の variant / size が落ち、
    // JSDoc の @import による import 文の上書きもこのエンジンでしか効かない
    experimentalReactComponentMeta: true,
  },
};

export default config;
