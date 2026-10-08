import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CTScheduleCarousel } from "@/components/CTScheduleCarousel";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { createMembers, createSchedules } from "@/src/design-system/mocks/ct";

type PageProps = {
  /** 参加者の人数 */
  participants: number;
  /** 表示する週数（本番は5年分。Storybook では軽くするため絞る） */
  weeks: number;
};

/**
 * トップページ（src/app/page.tsx）の見た目を、モックデータで再現したもの。
 * page.tsx はサーバー側で DB・Slack に接続するため、そのままは Storybook で動かせない。
 * カード (CTScheduleCard) と組み合わせのロジックは本物を使い、ヘッダーのログインボタンだけ見た目の代用品にしている。
 */
const CTSchedulePage = ({ participants, weeks }: PageProps) => {
  const members = createMembers(participants);
  const schedules = createSchedules(members, weeks);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl p-10">
        <div className="grid gap-5">
          <div className="flex items-center justify-between gap-10">
            <h1 className="text-2xl font-bold">CT組み合わせ表</h1>
            {/* 本物は SigninWithSlackButton (サーバーアクション) */}
            <Button variant="outline">Sign in with Slack</Button>
          </div>
          <section>
            <p>
              現在のメンバー：
              {/* Storybook 内では「Pages/メンバー一覧」へ移動する (本物は next/link で /member へ) */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Storybook の画面間移動 (next/link は使えない) */}
              <a
                href="/?path=/story/pages-メンバー一覧--default"
                target="_top"
                className="underline"
              >
                {participants}人
              </a>
            </p>
          </section>
        </div>
        <div className="mt-10">
          <CTScheduleCarousel schedules={schedules} />
        </div>
      </main>
    </>
  );
};

const meta = {
  title: "Pages/CT組み合わせ表",
  component: CTSchedulePage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "本番（https://ct-schedule.vercel.app/）のトップページをモックデータで再現した画面。デザインシステムの変更が画面全体にどう効くかをここで確認する。",
      },
    },
  },
  argTypes: {
    participants: { control: { type: "range", min: 0, max: 30, step: 1 } },
    weeks: { control: { type: "range", min: 1, max: 52, step: 1 } },
  },
  args: {
    participants: 20,
    weeks: 12,
  },
} satisfies Meta<typeof CTSchedulePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 本番と同じ 20 人 */
export const Default: Story = {};

/** 参加人数が奇数（毎週1人がお休み） */
export const OddParticipants: Story = {
  args: { participants: 19 },
};

/** 少人数 */
export const FewParticipants: Story = {
  args: { participants: 3 },
};

/** 参加者が1人以下（組み合わせが作れない） */
export const Empty: Story = {
  args: { participants: 1 },
};
