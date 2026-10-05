import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { mocked } from "storybook/test";
import { getHolidays, getUserBySlackId, getUsers } from "@/app/actions";
import { mockedAuth } from "@/src/stories/mocks";
import {
  createHolidays,
  createSession,
  createUsers,
  newUser,
  oddUsers,
  users,
  usersWithAbsent,
} from "@/src/stories/fixtures";
import { filterFromToday, mondays } from "@/src/utils/date";
import Home from "./page";

const meta = {
  title: "Pages/CTSchedule",
  component: Home,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
    docs: {
      description: {
        component: [
          "トップページ（`/`）。今週以降の CT の組み合わせを、週ごとのカードで横に並べて見せる。",
          "",
          "DB・認証・Slack は `sb.mock` でモックしている（`src/app/__mocks__/actions.ts` など）。",
          "日付は Story を開いた日を基準に生成されるため、表示される週は日によって変わる。",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未ログイン。組み合わせは見られるが、ヘッダーには Slack ログインボタンが出る */
export const LoggedOut: Story = {};

/** ログイン済み。ヘッダーにアバター（メニュー）が出る */
export const LoggedIn: Story = {
  beforeEach: () => {
    mockedAuth.mockResolvedValue(createSession());
  },
};

/** 参加人数が奇数。毎週1人が「お休み」になる */
export const OddMembers: Story = {
  beforeEach: () => {
    mocked(getUsers).mockResolvedValue(oddUsers);
  },
};

/** 3週目が祝日。その週のカードは組み合わせの代わりに祝日名を出す */
export const WithHoliday: Story = {
  beforeEach: () => {
    mocked(getHolidays).mockResolvedValue(
      createHolidays(filterFromToday(mondays)),
    );
  },
};

/** 不参加のメンバーは組み合わせにも参加人数にも含めない */
export const WithAbsentMembers: Story = {
  beforeEach: () => {
    mocked(getUsers).mockResolvedValue(usersWithAbsent);
  },
};

/** 参加者が多いと1枚のカードが縦に伸びる */
export const ManyMembers: Story = {
  beforeEach: () => {
    mocked(getUsers).mockResolvedValue(createUsers(12));
  },
};

/** 参加者が1人以下だと組み合わせが作れず、カードが1枚も出ない */
export const NoMembers: Story = {
  beforeEach: () => {
    mocked(getUsers).mockResolvedValue([]);
  },
};

/** 初回ログイン直後。社員番号・u チャンネルが未設定なので設定ダイアログが開く */
export const FirstLogin: Story = {
  beforeEach: () => {
    mockedAuth.mockResolvedValue(createSession(newUser));
    mocked(getUserBySlackId).mockResolvedValue(newUser);
    mocked(getUsers).mockResolvedValue([...users, newUser]);
  },
};
