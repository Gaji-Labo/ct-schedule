import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, mocked, screen, waitFor } from "storybook/test";
import { deleteUser } from "@/app/actions";
import { withToaster } from "@/src/stories/decorators";
import { currentUser, longNameUser } from "@/src/stories/fixtures";
import { DeleteMemberDialog } from "./DeleteMemberDialog";

const meta = {
  title: "Domain/DeleteMemberDialog",
  component: DeleteMemberDialog,
  tags: ["autodocs"],
  decorators: [withToaster],
  parameters: {
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component: [
          "メンバー一覧の行末に置く削除ボタンと、その確認ダイアログ。ログイン中のときだけ表示する。",
          "",
          "削除に成功すると toast を出してページを再取得する（`router.refresh()`）。",
          "削除は `deleteUser`（Server Action）のモックで動く。",
        ].join("\n"),
      },
    },
  },
  args: { member: currentUser },
} satisfies Meta<typeof DeleteMemberDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ゴミ箱アイコンのボタン */
export const Default: Story = {};

/** 確認ダイアログを開いた状態 */
export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(await screen.findByRole("dialog")).toHaveTextContent(
      `${currentUser.slack_display_name} を削除しますか？`,
    );
  },
};

/** 長い名前でもダイアログからはみ出さない */
export const LongName: Story = {
  args: { member: longNameUser },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(await screen.findByRole("dialog")).toHaveTextContent(
      `${longNameUser.slack_display_name} を削除しますか？`,
    );
  },
};

/** 削除するとダイアログが閉じ、成功の toast が出る */
export const DeleteSucceeded: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button"));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    await expect(deleteUser).toHaveBeenCalledWith(currentUser.id);
    // 閉じるアニメーション中も DOM に残るため、要素が消えるかではなく状態で判定する
    await waitFor(() =>
      expect(dialog).toHaveAttribute("data-state", "closed"),
    );
    await expect(
      await screen.findByText(`${currentUser.slack_display_name} を削除しました`),
    ).toBeInTheDocument();
  },
};

/** 削除に失敗するとダイアログは開いたまま、エラーの toast が出る */
export const DeleteFailed: Story = {
  beforeEach: () => {
    mocked(deleteUser).mockRejectedValue(new Error("DB error"));
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(await screen.findByRole("button", { name: "削除" }));
    await expect(
      await screen.findByText("メンバーの削除に失敗しました"),
    ).toBeInTheDocument();
    await expect(screen.getByRole("dialog")).toBeInTheDocument();
  },
};
