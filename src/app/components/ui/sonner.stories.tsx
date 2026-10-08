import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "./button";
import { Toaster } from "./sonner";

/**
 * 元: shadcn-storybook-registry (radix/sonner-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "操作結果を一時的に知らせる通知（toast）。`Toaster` はアプリ全体で1つだけ（`layout.tsx` に `position=\"top-center\"` で設置済み）。",
          "画面からは `import { toast } from \"sonner\"` で呼び出す。",
          "",
          "**使い分け**",
          "- `toast.success`: 保存・追加・削除などが完了した（例: 「山田 を削除しました」）",
          "- `toast.error`: 失敗した。何が失敗したかを書く（例: 「メンバーの削除に失敗しました」）",
          "- `toast`: 上記以外のお知らせ。`description` で補足を付けられる",
          "",
          "ユーザーの判断が必要な内容（削除の確認など）は toast ではなく `Dialog` を使う。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
      table: { defaultValue: { summary: "top-center (アプリでの設定)" } },
    },
  },
  args: {
    position: "top-center",
  },
  render: (args) => (
    <div className="flex min-h-96 items-center justify-center gap-2">
      <Button variant="outline" onClick={() => toast.success("山田 を削除しました")}>
        成功
      </Button>
      <Button variant="outline" onClick={() => toast.error("メンバーの削除に失敗しました")}>
        失敗
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("今週の組み合わせを更新しました", {
            description: "10月13日（月）の CT",
          })
        }
      >
        お知らせ
      </Button>
      <Toaster {...args} />
    </div>
  ),
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ボタンを押すと、それぞれの種類の toast が表示される */
export const Default: Story = {};

export const ShouldShowToast: Story = {
  name: "ボタンを押すと toast が表示される",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body);
    toast.dismiss();
    await waitFor(() => expect(body.queryByRole("listitem")).not.toBeInTheDocument());

    await step("成功の toast を出す", async () => {
      await userEvent.click(await body.findByRole("button", { name: "成功" }));
      await expect(await body.findByText("山田 を削除しました")).toBeInTheDocument();
    });

    await step("続けて出すと積み重なる", async () => {
      await userEvent.click(await body.findByRole("button", { name: "失敗" }));
      await userEvent.click(await body.findByRole("button", { name: "お知らせ" }));
      await waitFor(() => expect(body.getAllByRole("listitem")).toHaveLength(3));
    });
  },
};
