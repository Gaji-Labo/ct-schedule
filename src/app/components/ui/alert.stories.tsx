import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

/**
 * 元: shadcn-storybook-registry (radix/alert-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "ページの中に置いておく、お知らせ・注意・エラーのメッセージ。ユーザーが読み終えるまで消えない。",
          "",
          "**variant の選び方**（内容の意味で選ぶ）",
          "- `info`: 情報・お知らせ（例: メンテナンスのお知らせ）",
          "- `success`: 完了・有効になったこと（例: 初期設定が完了した）",
          "- `warning`: 注意・このままだと困ること（例: プロフィールが未設定）",
          "- `destructive`: エラー・失敗（例: データを読み込めなかった）",
          "- `default`: 色の意味を持たせない中立のメッセージ",
          "",
          "色は Semantic トークン `feedback-*`（Foundations/Colors の Feedback message）。背景・文字・枠線・アイコンをセットで使い、文字は背景に対して 4.5:1 以上。",
          "色だけに頼らず、意味は `AlertTitle` の文言とアイコンでも伝える。",
          "",
          "**使い分け**",
          "- 操作の結果を一時的に知らせるだけなら `toast`",
          "- 判断を求める（削除の確認など）なら `Dialog`",
          "- 入力欄 1 つのエラーなら、その入力欄のすぐ下に文字で出す",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "info", "success", "warning", "destructive"],
      table: { defaultValue: { summary: "default" } },
    },
  },
  args: {
    variant: "info",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Alert {...args}>
      <Info aria-hidden />
      <AlertTitle>メンテナンスのお知らせ</AlertTitle>
      <AlertDescription>
        10月12日（月）は終日メンテナンスのため利用できません。
      </AlertDescription>
    </Alert>
  ),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 情報・お知らせ */
export const Info_: Story = { name: "Info" };

/** エラー・対応が必要なこと */
export const Destructive: Story = {
  args: { variant: "destructive" },
  render: (args) => (
    <Alert {...args}>
      <CircleAlert aria-hidden />
      <AlertTitle>データを読み込めませんでした</AlertTitle>
      <AlertDescription>
        時間をおいてページを再読み込みしてください。解決しない場合は #ct-schedule で知らせてください。
      </AlertDescription>
    </Alert>
  ),
};

/** 注意・このままだと困ること */
export const Warning: Story = {
  args: { variant: "warning" },
  render: (args) => (
    <Alert {...args}>
      <TriangleAlert aria-hidden />
      <AlertTitle>プロフィールが未設定です</AlertTitle>
      <AlertDescription>
        通知を受け取るには、プロフィールでメールアドレスを設定してください。
      </AlertDescription>
    </Alert>
  ),
};

/** 完了・有効になったこと */
export const Success: Story = {
  args: { variant: "success" },
  render: (args) => (
    <Alert {...args}>
      <CircleCheck aria-hidden />
      <AlertTitle>設定を保存しました</AlertTitle>
      <AlertDescription>次回のログインから反映されます。</AlertDescription>
    </Alert>
  ),
};

/** タイトルだけの短いお知らせ */
export const TitleOnly: Story = {
  render: (args) => (
    <Alert {...args}>
      <Info aria-hidden />
      <AlertTitle>登録ユーザーは 10 人です</AlertTitle>
    </Alert>
  ),
};

/** 色の意味を持たせない中立のメッセージ */
export const Default: Story = {
  args: { variant: "default" },
};

/** すべての variant */
export const Variants: Story = {
  render: () => (
    <div className="grid gap-4">
      <Alert variant="info">
        <Info aria-hidden />
        <AlertTitle>お知らせ（info）</AlertTitle>
        <AlertDescription>10月12日（月）は終日メンテナンスのため利用できません。</AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheck aria-hidden />
        <AlertTitle>完了（success）</AlertTitle>
        <AlertDescription>初期設定が完了しました。</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert aria-hidden />
        <AlertTitle>注意（warning）</AlertTitle>
        <AlertDescription>プロフィールが未設定です。</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlert aria-hidden />
        <AlertTitle>エラー（destructive）</AlertTitle>
        <AlertDescription>データを読み込めませんでした。</AlertDescription>
      </Alert>
      <Alert>
        <Info aria-hidden />
        <AlertTitle>中立（default）</AlertTitle>
        <AlertDescription>色の意味を持たせないメッセージ。</AlertDescription>
      </Alert>
    </div>
  ),
};
