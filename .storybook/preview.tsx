import type { Preview } from "@storybook/nextjs-vite";
import { sb } from "storybook/test";
import { withThemeByClassName } from "@storybook/addon-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../src/app/globals.css";
import "./preview.css";

// DB・認証・Slack API に依存するモジュールを、隣の __mocks__/ にあるモックへ差し替える。
// 戻り値は Story の beforeEach で mocked(fn).mockResolvedValue(...) により変えられる
sb.mock(import("../src/app/actions.ts"));
sb.mock(import("../auth.ts"));
sb.mock(import("../src/lib/slack.ts"));

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
