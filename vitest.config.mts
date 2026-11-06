import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Story をテストとして回す（@storybook/addon-vitest）。全 Story を描画し、play 関数と a11y チェック（axe）を当てる。
 *   bun run test:stories
 * ふつうのユニットテストは bun test で回す（ここには入れない）。
 * https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
 */
export default defineConfig({
  resolve: {
    // tsconfig.json の paths と同じ。Storybook 本体は Next.js の設定から読むが、Vitest には別に渡す必要がある
    alias: [
      { find: /^@\/components\//, replacement: `${path.join(dirname, "src/app/components")}/` },
      { find: /^@\/app\//, replacement: `${path.join(dirname, "src/app")}/` },
      { find: /^@\//, replacement: `${dirname}/` },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
