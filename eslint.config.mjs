import nextPlugin from "@next/eslint-plugin-next";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import storybook from "eslint-plugin-storybook";
import designSystem from "./eslint/design-system-plugin.mjs";

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "storybook-static/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  ...storybook.configs["flat/recommended"],

  // デザインシステム準拠チェック (ルールの意図は DESIGN.md を参照)
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "design-system": designSystem },
    rules: {
      "design-system/no-palette-color": "error",
      "design-system/no-arbitrary-value": "error",
    },
  },
  {
    // shadcn/ui の生成コードは配置計算などで任意値を使うため対象外
    files: ["src/app/components/ui/**"],
    rules: { "design-system/no-arbitrary-value": "off" },
  },
  {
    // 既知の違反 (デザインシステム導入前のコード)。置き換えたらこのリストから外す
    files: [
      "src/app/member/page.tsx",
      "src/app/components/CTScheduleCard.tsx",
      "src/app/components/SigninWithSlackButton.tsx",
      "src/app/components/ui/dialog.tsx",
    ],
    rules: { "design-system/no-palette-color": "warn" },
  },
  {
    files: [
      "src/app/components/CTScheduleCard.tsx",
      "src/app/components/DeleteMemberDialog.tsx",
      "src/app/components/SetupDataDialog.tsx",
      "src/app/components/UserDropdown.tsx",
    ],
    rules: { "design-system/no-arbitrary-value": "warn" },
  },
];
