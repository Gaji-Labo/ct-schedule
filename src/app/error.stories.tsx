import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import ErrorPage from "./error";

const meta = {
  title: "Pages/Error",
  component: ErrorPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "ページ表示中のエラー（`app/error.tsx`）。エラーメッセージと「リトライ」ボタンを出す。",
          "",
          "現状はメッセージをそのまま出すだけで、レイアウトや文言は未整備。",
        ].join("\n"),
      },
    },
  },
  args: {
    error: new Error("メンバーの取得に失敗しました"),
    reset: fn(),
  },
} satisfies Meta<typeof ErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 長いエラーメッセージ */
export const LongMessage: Story = {
  args: {
    error: new Error(
      "NeonDbError: Error connecting to database: fetch failed. The database endpoint may be suspended or the connection string may be invalid.",
    ),
  },
};

/** 「リトライ」で reset が呼ばれる */
export const Retry: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "リトライ" }));
    await expect(args.reset).toHaveBeenCalled();
  },
};
