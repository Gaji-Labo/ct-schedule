/**
 * デザイントークンのカタログ
 *
 * 値の実体は src/app/globals.css (CSS 変数) と tailwind.config.ts にある。
 * このファイルは「どのトークンを・どの用途で使うか」を記述するメタデータで、
 * Storybook の Foundations ページと、AI が UI を実装するときの参照元を兼ねる。
 *
 * トークンを追加・変更したら globals.css / tailwind.config.ts / このファイルの3箇所を揃えること。
 */

export type ColorToken = {
  /** CSS 変数名 (先頭の -- を除く) */
  name: string;
  /** Tailwind で使うときのクラス名の例 */
  tailwind: string;
  /** 用途。AI・人間がトークンを選ぶときの判断材料 */
  usage: string;
};

export type ColorTokenGroup = {
  title: string;
  description: string;
  tokens: ColorToken[];
};

/** Semantic カラー。コンポーネントからはこれだけを使う */
export const semanticColors: ColorTokenGroup[] = [
  {
    title: "Base",
    description: "画面全体・テキストの基本色",
    tokens: [
      { name: "background", tailwind: "bg-background", usage: "ページの背景" },
      { name: "foreground", tailwind: "text-foreground", usage: "本文テキスト" },
      { name: "muted", tailwind: "bg-muted", usage: "控えめな面 (リスト行、補足エリア)" },
      {
        name: "muted-foreground",
        tailwind: "text-muted-foreground",
        usage: "補足テキスト・番号・区切り記号・非活性アイコン",
      },
      { name: "border", tailwind: "border-border", usage: "枠線・区切り線 (border クラスの既定色)" },
      { name: "input", tailwind: "border-input", usage: "フォーム入力欄の枠線" },
      { name: "ring", tailwind: "ring-ring", usage: "フォーカスリング" },
    ],
  },
  {
    title: "Surface",
    description: "カード・ポップオーバーなど浮いた面",
    tokens: [
      { name: "card", tailwind: "bg-card", usage: "カードの背景" },
      { name: "card-foreground", tailwind: "text-card-foreground", usage: "カード内テキスト" },
      { name: "popover", tailwind: "bg-popover", usage: "ドロップダウン・ツールチップの背景" },
      { name: "popover-foreground", tailwind: "text-popover-foreground", usage: "ポップオーバー内テキスト" },
    ],
  },
  {
    title: "Action",
    description: "ボタン・インタラクティブ要素",
    tokens: [
      { name: "primary", tailwind: "bg-primary", usage: "主要アクション (1画面に1つが目安)" },
      { name: "primary-foreground", tailwind: "text-primary-foreground", usage: "primary 上のテキスト" },
      { name: "secondary", tailwind: "bg-secondary", usage: "副次アクション" },
      { name: "secondary-foreground", tailwind: "text-secondary-foreground", usage: "secondary 上のテキスト" },
      { name: "accent", tailwind: "bg-accent", usage: "hover / 選択中のハイライト" },
      { name: "accent-foreground", tailwind: "text-accent-foreground", usage: "accent 上のテキスト" },
    ],
  },
  {
    title: "Feedback",
    description: "成功・危険などの状態",
    tokens: [
      { name: "destructive", tailwind: "bg-destructive", usage: "削除など取り消せない操作、エラー" },
      {
        name: "destructive-foreground",
        tailwind: "text-destructive-foreground",
        usage: "destructive 上のテキスト",
      },
      { name: "success", tailwind: "bg-success", usage: "成功・有効状態 (参加中インジケーターなど)" },
      { name: "success-foreground", tailwind: "text-success-foreground", usage: "success 上のテキスト" },
    ],
  },
  {
    title: "Domain (CTスケジュール)",
    description: "このアプリ固有の意味を持つ色。gray-* を直接書かずにこちらを使う",
    tokens: [
      { name: "status-holiday", tailwind: "bg-status-holiday", usage: "祝日の週のカード背景" },
      {
        name: "status-holiday-foreground",
        tailwind: "text-status-holiday-foreground",
        usage: "祝日カード内の補足テキスト",
      },
      { name: "status-rest", tailwind: "bg-status-rest", usage: "「お休み」「祝日名」ラベルの背景" },
      {
        name: "status-rest-foreground",
        tailwind: "text-status-rest-foreground",
        usage: "status-rest 上のテキスト",
      },
      {
        name: "highlight-current",
        tailwind: "border-highlight-current",
        usage: "今週 (直近) のスケジュールを示す強調枠",
      },
    ],
  },
];

/** Primitive カラー。Semantic トークンの定義にのみ使い、コンポーネントからは参照しない */
export const primitiveColors: { title: string; names: string[] }[] = [
  {
    title: "Neutral",
    names: ["0", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map(
      (step) => `neutral-${step}`,
    ),
  },
  { title: "Red", names: ["red-500", "red-800"] },
  { title: "Green", names: ["green-500", "green-700"] },
];

/** 角丸。--radius (0.5rem) を基準に派生 */
export const radii = [
  { tailwind: "rounded-sm", value: "calc(var(--radius) - 4px)", usage: "小さい要素 (チェックボックス、ドロップダウン項目)" },
  { tailwind: "rounded-md", value: "calc(var(--radius) - 2px)", usage: "ボタン・入力欄・リスト行" },
  { tailwind: "rounded-lg", value: "var(--radius)", usage: "カード・ダイアログ" },
  { tailwind: "rounded-full", value: "9999px", usage: "アバター・ステータスラベル (pill)" },
];

/** タイポグラフィ。Tailwind 既定スケールのうち、このアプリで使うもの */
export const typography = [
  { tailwind: "text-2xl font-bold", usage: "ページタイトル (h1)" },
  { tailwind: "text-lg font-semibold", usage: "セクション・カードの見出し (h2)" },
  { tailwind: "text-sm font-medium", usage: "本文・ラベル・ユーザー名 (既定)" },
  { tailwind: "text-sm text-muted-foreground", usage: "補足説明" },
  { tailwind: "text-xs", usage: "番号・バッジ・注釈" },
];

/** 余白。Tailwind 既定の 4px グリッドのうち、このアプリで使うもの */
export const spacing = [
  { tailwind: "1", px: 4, usage: "アイコンとテキストの最小間隔" },
  { tailwind: "2", px: 8, usage: "要素内の間隔 (gap-2)・小さいパディング" },
  { tailwind: "3", px: 12, usage: "リスト行のパディング (p-3)" },
  { tailwind: "4", px: 16, usage: "カードのパディング (p-4)・セクション内の間隔" },
  { tailwind: "6", px: 24, usage: "セクション間の間隔" },
  { tailwind: "8", px: 32, usage: "ページの上下余白" },
];

/** 影 */
export const shadows = [
  { tailwind: "shadow-sm", usage: "カード・入力欄" },
  { tailwind: "shadow", usage: "ボタン (primary / destructive)" },
  { tailwind: "shadow-md", usage: "ポップオーバー・ドロップダウン" },
  { tailwind: "shadow-lg", usage: "ダイアログ" },
];
