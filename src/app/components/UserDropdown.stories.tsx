import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, mocked, screen, waitFor } from "storybook/test";
import { updateUser } from "@/app/actions";
import { withToaster } from "@/src/stories/decorators";
import { channels, currentUser, longNameUser } from "@/src/stories/fixtures";
import { UserDropdown } from "./UserDropdown";

const meta = {
  title: "Domain/UserDropdown",
  component: UserDropdown,
  tags: ["autodocs"],
  decorators: [withToaster],
  parameters: {
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component: [
          "ヘッダー右端のユーザーメニュー。アバターを押すと「編集」「ログアウト」が出る。",
          "",
          "「編集」はプロフィール編集ダイアログを開く。保存は `updateUser`（Server Action）のモックで動く。",
          "「ログアウト」は Auth.js の `signOut` を呼ぶため、Storybook では押さないこと（モックしていない）。",
        ].join("\n"),
      },
    },
  },
  args: { user: currentUser, channels },
} satisfies Meta<typeof UserDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const openMenu: Story["play"] = async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole("button"));
  await expect(await screen.findByRole("menu")).toBeInTheDocument();
};

const openEditDialog: Story["play"] = async (context) => {
  await openMenu(context);
  await context.userEvent.click(
    await screen.findByRole("menuitem", { name: "編集" }),
  );
  await expect(await screen.findByRole("dialog")).toBeInTheDocument();
};

export const Default: Story = {};

/** メニューを開いた状態 */
export const MenuOpen: Story = {
  play: openMenu,
};

/** 長い名前でもメニューが崩れない */
export const LongName: Story = {
  args: { user: longNameUser },
  play: openMenu,
};

/** プロフィール編集ダイアログ。現在の値が入っている */
export const EditDialog: Story = {
  play: openEditDialog,
};

/** 保存するとダイアログが閉じ、toast が出る */
export const EditSucceeded: Story = {
  play: async (context) => {
    await openEditDialog(context);
    const dialog = screen.getByRole("dialog");
    const name = screen.getByLabelText("名前");
    await context.userEvent.clear(name);
    await context.userEvent.type(name, "山田 次郎");
    await context.userEvent.click(screen.getByRole("button", { name: "保存" }));
    await expect(updateUser).toHaveBeenCalledWith(
      currentUser.id,
      "山田 次郎",
      currentUser.employee_number,
      true,
      currentUser.slack_u_channel_id,
    );
    // 閉じるアニメーション中も DOM に残るため、要素が消えるかではなく状態で判定する
    await waitFor(() =>
      expect(dialog).toHaveAttribute("data-state", "closed"),
    );
    await expect(await screen.findByText("更新しました")).toBeInTheDocument();
  },
};

/** 保存に失敗するとダイアログは開いたまま、エラーの toast が出る */
export const EditFailed: Story = {
  beforeEach: () => {
    mocked(updateUser).mockRejectedValue(new Error("他人のプロフィールは更新できません"));
  },
  play: async (context) => {
    await openEditDialog(context);
    await context.userEvent.click(screen.getByRole("button", { name: "保存" }));
    await expect(await screen.findByText("更新に失敗しました")).toBeInTheDocument();
    await expect(screen.getByRole("dialog")).toBeInTheDocument();
  },
};
