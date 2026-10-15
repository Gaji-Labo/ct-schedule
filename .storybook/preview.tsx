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
          "Domain",
          "Patterns",
          "Pages",
        ],
      },
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
