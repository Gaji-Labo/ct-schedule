import type { Preview } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables } from "@/src/lib/fonts";
import "../src/app/globals.css";
import "./preview.css";

// アプリ (layout.tsx) と同じフォントの CSS 変数を <html> に付ける。
// Dialog など body 直下に出る部品にも効かせるため、デコレーターではなく html 要素に付ける
if (typeof document !== "undefined") {
  document.documentElement.classList.add(...fontVariables.split(" "));
}

const preview: Preview = {
  parameters: {
    layout: "centered",

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    options: {
      storySort: {
        order: [
          "Foundations",
          ["Introduction", "Colors", "Typography", "*"],
          "UI",
          "Patterns",
          "Apps",
          ["*", ["Components", "Pages"]],
          "Drafts",
        ],
      },
    },

    // bun run test:stories で全 Story に axe（WCAG 2.2 AA）を当て、違反があれば落とす。
    // 直すまで残す違反は、その Story（か meta）の parameters.a11y で規則を止め、理由をコメントに書く
    a11y: {
      test: "error",
      options: { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    // アプリ本体の layout.tsx と同じ Provider で包む
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default preview;
