import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";
import { Button } from "./button";
import { Toaster } from "./sonner";

const meta = {
  title: "UI/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "操作結果の通知。`Toaster` は layout に1つだけ置き、各画面からは `toast()` を呼ぶ。",
          "",
          "- 成功: `toast.success(\"〇〇を削除しました\")` — 何が起きたかを書く",
          "- 失敗: `toast.error(\"〇〇に失敗しました\")` — 何が失敗したかを書く",
          "- 取り消せる操作なら `action` で「元に戻す」を付けられる",
          "",
          "ボタンを押すと右上（アプリでは画面上部中央）に表示される。",
        ].join("\n"),
      },
    },
  },
  args: { position: "top-center" },
  render: (args) => (
    <>
      <Toaster {...args} />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => toast.success("山田 太郎 を削除しました")}
        >
          成功
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("メンバーの削除に失敗しました")}
        >
          失敗
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("設定が完了しました", {
              description: "次の月曜から組み合わせに入ります",
            })
          }
        >
          説明つき
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("山田 太郎 を削除しました", {
              action: { label: "元に戻す", onClick: () => {} },
            })
          }
        >
          操作つき
        </Button>
      </div>
    </>
  ),
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 表示された状態 */
export const Shown: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "成功" }));
    await userEvent.click(canvas.getByRole("button", { name: "失敗" }));
  },
};
