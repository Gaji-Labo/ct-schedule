import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mocked } from "storybook/test";
import { getUsers } from "@/app/actions";
import { mockedAuth } from "@/src/stories/mocks";
import { withToaster } from "@/src/stories/decorators";
import {
  createSession,
  createUsers,
  longNameUser,
  users,
  usersWithAbsent,
} from "@/src/stories/fixtures";
import MemberPage from "./page";

const meta = {
  title: "Pages/Member",
  component: MemberPage,
  decorators: [withToaster],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/member" } },
    docs: {
      description: {
        component: [
          "メンバー一覧（`/member`）。参加メンバーと参加・不参加の状態を見せる。ログイン中は各行に削除ボタンが出る。",
          "",
          "DB・認証は `sb.mock` でモックしている（`src/app/__mocks__/actions.ts` など）。",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof MemberPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未ログイン。削除ボタンは出ない */
export const LoggedOut: Story = {};

/** ログイン中。各行に削除ボタンが出る */
export const LoggedIn: Story = {
  beforeEach: () => {
    mockedAuth.mockResolvedValue(createSession());
  },
};

/** 不参加のメンバーを含む */
export const WithAbsentMembers: Story = {
  beforeEach: () => {
    mocked(getUsers).mockResolvedValue(usersWithAbsent);
  },
};

/** 長い名前 */
export const LongName: Story = {
  beforeEach: () => {
    mockedAuth.mockResolvedValue(createSession());
    mocked(getUsers).mockResolvedValue([longNameUser, ...users]);
  },
};

/** メンバーが多い */
export const ManyMembers: Story = {
  beforeEach: () => {
    mocked(getUsers).mockResolvedValue(createUsers(30));
  },
};

/** メンバーが0人。現状は見出しだけが出る（空状態の表示は未実装） */
export const Empty: Story = {
  beforeEach: () => {
    mocked(getUsers).mockResolvedValue([]);
  },
};
