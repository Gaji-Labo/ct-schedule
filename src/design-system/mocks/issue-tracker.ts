/**
 * Storybook 用のモックデータ (Issueトラッカー)
 *
 * 件数は本番の目安 (オープン 1,048件 / クローズ 5,614件、1ページ25件) に合わせる。
 * 日時は固定 (NOW から逆算) にして、Story の見た目が日によって変わらないようにする。
 */
import type { IssueLabelData } from "@/components/IssueLabel";
import type { Issue, IssueUser } from "@/components/IssueListItem";

export const ISSUE_COUNTS = { open: 1048, closed: 5614 } as const;
export const ISSUES_PER_PAGE = 25;

const NOW = new Date("2026-11-05T10:00:00+09:00");
const HOUR = 60 * 60 * 1000;

const HANDLES = [
  "yamada", "sato", "suzuki", "tanaka", "takahashi",
  "ito", "watanabe", "nakamura", "kobayashi", "kato",
  "yoshida", "yamaguchi", "matsumoto", "inoue", "kimura",
];

export const issueUser = (index: number): IssueUser => {
  const handle = HANDLES[index % HANDLES.length];
  return { slack_user_id: `U${String(index + 1).padStart(4, "0")}`, slack_display_name: handle, slack_image: "" };
};

export const LABELS = {
  bug: { name: "bug", color: "destructive" },
  enhancement: { name: "enhancement", color: "info" },
  needsTriage: { name: "needs-triage", color: "warning" },
  documentation: { name: "documentation", color: "secondary" },
  question: { name: "question", color: "outline" },
  goodFirstIssue: { name: "good first issue", color: "success" },
  performance: { name: "performance", color: "secondary" },
  regression: { name: "regression", color: "destructive" },
} satisfies Record<string, IssueLabelData>;

/** 絞り込みの候補 */
export const FILTER_OPTIONS = {
  author: HANDLES,
  label: Object.values(LABELS).map((label) => label.name),
  project: ["ロードマップ 2026", "サポート対応"],
  milestone: ["v4.2.0", "v4.3.0", "v5.0.0"],
  assignee: ["割り当てなし", ...HANDLES.slice(0, 6)],
  type: ["不具合", "要望", "質問"],
};

const TITLES: { title: string; labels: IssueLabelData[] }[] = [
  { title: "`build --watch` で設定ファイルを変更しても再読み込みされない", labels: [LABELS.bug, LABELS.needsTriage] },
  { title: "ダークモードでコードブロックの背景と文字のコントラストが足りない", labels: [LABELS.bug] },
  { title: "CLI に `--json` オプションを追加して結果を機械的に読めるようにしたい", labels: [LABELS.enhancement] },
  { title: "README のインストール手順が古い", labels: [LABELS.documentation, LABELS.goodFirstIssue] },
  { title: "Windows で `init` コマンドを実行するとパスの区切り文字が混ざる", labels: [LABELS.bug] },
  { title: "大きなリポジトリで検索が遅い", labels: [LABELS.performance, LABELS.needsTriage] },
  { title: "設定ファイルで環境変数を参照する方法はありますか？", labels: [LABELS.question] },
  { title: "v4.1.0 にしてからプラグインが読み込まれない", labels: [LABELS.bug, LABELS.regression] },
  { title: "エラーメッセージに対処方法へのリンクを載せてほしい", labels: [LABELS.enhancement, LABELS.goodFirstIssue] },
  { title: "ログの出力先を指定できるようにする", labels: [] },
];

type Options = {
  state: "open" | "closed";
  count?: number;
  /** 番号の先頭 (新しい順なので、ここから減っていく) */
  startNumber?: number;
};

/** 1ページ分の Issue (新しい順) */
export function createIssues({ state, count = ISSUES_PER_PAGE, startNumber = 14931 }: Options): Issue[] {
  return Array.from({ length: count }, (_, i) => {
    const base = TITLES[i % TITLES.length];
    const createdAt = new Date(NOW.getTime() - (i * 7 + 2) * HOUR);
    const closed = state === "closed";
    return {
      number: startNumber - i * (closed ? 3 : 1),
      title: base.title,
      state: closed ? (i % 4 === 3 ? "not_planned" : "completed") : "open",
      labels: base.labels,
      author: issueUser(i * 2 + 1).slack_display_name,
      createdAt,
      closedBy: closed ? issueUser(i % 3).slack_display_name : undefined,
      closedAt: closed ? new Date(createdAt.getTime() + 20 * HOUR) : undefined,
      comments: [3, 0, 12, 1, 0, 5, 2, 0, 27, 1][i % 10],
      linkedPullRequests: i % 4 === 0 ? 1 : i % 9 === 0 ? 2 : 0,
      assignees: i % 3 === 0 ? [issueUser(i % 5)] : i % 7 === 0 ? [issueUser(1), issueUser(2)] : [],
    };
  });
}

/** 長い題名・多いラベル・多い担当者 */
export function createLongIssues(): Issue[] {
  const longTitle =
    "モノレポ構成で `workspace:*` を指定したパッケージを `build --filter` で絞り込んでビルドすると、依存先のパッケージが先にビルドされずに型定義が見つからないというエラーになり、CI のキャッシュを消すまで直らないことがある";
  const all = Object.values(LABELS);
  return [
    {
      ...createIssues({ state: "open", count: 1 })[0],
      title: longTitle,
      labels: all,
      assignees: [issueUser(0), issueUser(1), issueUser(2), issueUser(3), issueUser(4)],
      comments: 1284,
      linkedPullRequests: 12,
    },
    {
      ...createIssues({ state: "open", count: 2 })[1],
      title: "Averyveryveryverylongidentifierwithoutanyspacesthatmightoverflowthelayoutifnothandledcorrectly_in_the_issue_title",
    },
    ...createIssues({ state: "open", count: 8 }).slice(2),
  ];
}
