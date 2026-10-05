import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, mocked, screen, waitFor } from "storybook/test";
import { setUser } from "@/app/actions";
import { withToaster } from "@/src/stories/decorators";
import { channels, newUser } from "@/src/stories/fixtures";
import { SetupDataDialog } from "./SetupDataDialog";

const meta = {
  title: "Domain/SetupDataDialog",
  component: SetupDataDialog,
  tags: ["autodocs"],
  decorators: [withToaster],
  parameters: {
    docs: {
      description: {
        component: [
          "初回ログイン時の設定ダイアログ。社員番号か u チャンネルが未設定のユーザーに、トップページで自動的に開く。",
          "",
          "- 社員番号と u チャンネルの両方を入れるまで「保存」は押せない",
          "- 保存は `setUser`（Server Action）のモックで動く",
        ].join("\n"),
      },
      story: { inline: false, iframeHeight: 480 },
    },
  },
  args: { user: newUser, channels },
} satisfies Meta<typeof SetupDataDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** u チャンネルは設定済みで、社員番号だけが未設定のユーザー */
const userWithoutEmployeeNumber = {
  ...newUser,
  slack_u_channel_id: channels[1].id,
};

/** 開いた直後。必須項目が空なので保存できない */
export const Default: Story = {
  play: async () => {
    await expect(
      await screen.findByRole("button", { name: "保存" }),
    ).toBeDisabled();
  },
};

/** 選べる u チャンネルが無い */
export const NoChannels: Story = {
  args: { channels: [] },
};

/** u チャンネルだけ設定済み。社員番号を入れると保存でき、ダイアログが閉じて toast が出る */
export const FillAndSave: Story = {
  args: { user: userWithoutEmployeeNumber },
  play: async ({ userEvent }) => {
    const dialog = await screen.findByRole("dialog");
    await userEvent.type(screen.getByLabelText("社員番号"), "1100");

    const save = await screen.findByRole("button", { name: "保存" });
    await expect(save).toBeEnabled();
    await userEvent.click(save);

    await expect(setUser).toHaveBeenCalled();
    // 閉じるアニメーション中も DOM に残るため、要素が消えるかではなく状態で判定する
    await waitFor(() =>
      expect(dialog).toHaveAttribute("data-state", "closed"),
    );
    await expect(await screen.findByText("設定が完了しました")).toBeInTheDocument();
  },
};

/** 保存に失敗するとダイアログは開いたまま、エラーの toast が出る */
export const SaveFailed: Story = {
  args: { user: userWithoutEmployeeNumber },
  beforeEach: () => {
    mocked(setUser).mockRejectedValue(new Error("DB error"));
  },
  play: async ({ userEvent }) => {
    await userEvent.type(await screen.findByLabelText("社員番号"), "1100");
    await userEvent.click(await screen.findByRole("button", { name: "保存" }));
    await expect(await screen.findByText("設定に失敗しました")).toBeInTheDocument();
    await expect(screen.getByRole("dialog")).toBeInTheDocument();
  },
};
