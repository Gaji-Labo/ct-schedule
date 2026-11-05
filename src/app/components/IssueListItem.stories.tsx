import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { createIssues, createLongIssues, issueUser } from "@/src/design-system/mocks/issue-tracker";
import { IssueListItem } from "./IssueListItem";

const [open] = createIssues({ state: "open", count: 1 });
const closed = createIssues({ state: "closed", count: 4 });

const meta = {
  title: "Apps/Issueトラッカー/Components/IssueListItem",
  component: IssueListItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Issue 一覧の1行。状態アイコン（`IssueStateIcon`）・題名・ラベル（`IssueLabel`）・番号・作成者・日時、右端にプルリクエスト数・担当者・コメント数を出す（`md` 未満は2行目の下に回す）。",
          "",
          "- 題名だけが詳細へのリンク。作成者とラベルは、それぞれで一覧を絞り込むリンク（`filterHref` に `author:yamada` のような条件が渡る）",
          "- 題名の `` `...` `` で囲んだところはコードとして出す",
          "- プルリクエスト・担当者・コメントは、無いときは出さない。担当者は3人まで顔を出し、それ以上は「+n」",
          "- クローズの Issue は2行目に「○○ が 2026/11/03 に閉じた」が続く",
          "- 行の区切りと外枠は並べる側（一覧）で付ける",
        ].join("\n"),
      },
    },
  },
  args: {
    issue: open,
    href: "#",
    filterHref: (q: string) => `#q=${encodeURIComponent(q)}`,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl rounded-lg border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IssueListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** オープン。ラベル2つ・プルリクエスト1件・担当者1人・コメントあり */
export const Open: Story = {};

/** クローズ（完了）。閉じた人と日時が続く */
export const ClosedCompleted: Story = { args: { issue: closed[0] } };

/** クローズ（対応しない） */
export const ClosedNotPlanned: Story = { args: { issue: closed[3] } };

/** ラベル・担当者・コメント・プルリクエストが無い */
export const Minimal: Story = {
  args: {
    issue: { ...open, labels: [], assignees: [], comments: 0, linkedPullRequests: 0 },
  },
};

/** 長い題名（コードを含む）・ラベル全部・担当者5人・コメント4桁 */
export const LongContent: Story = { args: { issue: createLongIssues()[0] } };

/** 空白のない長い英字の題名でも、はみ出さずに折り返す */
export const LongUnbrokenTitle: Story = { args: { issue: createLongIssues()[1] } };

/** 担当者が2人 */
export const TwoAssignees: Story = {
  args: { issue: { ...open, assignees: [issueUser(1), issueUser(2)] } },
};
