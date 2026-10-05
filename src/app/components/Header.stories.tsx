import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { createSession, currentUser } from "@/src/stories/fixtures";
import { Header } from "./Header";

const meta = {
  title: "Domain/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component: [
          "各ページ上部のヘッダー。左にページタイトル（h1）、右にログイン状態を出す。",
          "",
          "- ログイン中: `UserDropdown`（アバターのメニュー）",
          "- 未ログイン: `SigninWithSlackButton`",
          "",
          "async な Server Component で、ログイン中は Slack API から u チャンネル一覧を取る（Storybook ではモック）。",
        ].join("\n"),
      },
    },
  },
  args: { title: "CT組み合わせ表", session: null, user: null },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const LoggedIn: Story = {
  args: { session: createSession(), user: currentUser },
};

/** タイトルが長くても右側のボタンを押し出さない */
export const LongTitle: Story = {
  args: {
    title: "とても長いページタイトルが入ったときにヘッダーがどう折り返されるかを確かめるための見出し",
    session: createSession(),
    user: currentUser,
  },
};
