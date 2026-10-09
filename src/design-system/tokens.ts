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
      { name: "site-header", tailwind: "bg-site-header", usage: "ページ最上部の帯 (SiteHeader) の背景。ライト・ダークとも黒" },
      { name: "site-header-foreground", tailwind: "text-site-header-foreground", usage: "SiteHeader 上のロゴ・テキスト (白)" },
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
    title: "Feedback message",
    description: "Alert・toast・Badge の色付きパターン。subtle=背景 / foreground=文字 / border=枠線 / icon=アイコン。組み合わせで使い、文字色を単体で他に流用しない",
    tokens: [
      { name: "feedback-info-subtle", tailwind: "bg-feedback-info-subtle", usage: "お知らせ・情報の背景" },
      { name: "feedback-info-foreground", tailwind: "text-feedback-info-foreground", usage: "お知らせ・情報の文字" },
      { name: "feedback-info-icon", tailwind: "text-feedback-info-icon", usage: "お知らせ・情報のアイコン" },
      { name: "feedback-success-subtle", tailwind: "bg-feedback-success-subtle", usage: "成功・完了の背景" },
      { name: "feedback-success-foreground", tailwind: "text-feedback-success-foreground", usage: "成功・完了の文字" },
      { name: "feedback-success-icon", tailwind: "text-feedback-success-icon", usage: "成功・完了のアイコン" },
      { name: "feedback-warning-subtle", tailwind: "bg-feedback-warning-subtle", usage: "注意の背景" },
      { name: "feedback-warning-foreground", tailwind: "text-feedback-warning-foreground", usage: "注意の文字" },
      { name: "feedback-warning-icon", tailwind: "text-feedback-warning-icon", usage: "注意のアイコン" },
      { name: "feedback-destructive-subtle", tailwind: "bg-feedback-destructive-subtle", usage: "エラー・失敗の背景" },
      { name: "feedback-destructive-foreground", tailwind: "text-feedback-destructive-foreground", usage: "エラー・失敗の文字" },
      { name: "feedback-destructive-icon", tailwind: "text-feedback-destructive-icon", usage: "エラー・失敗のアイコン" },
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
  {
    title: "Avatar",
    description: "画像が無いときのアバター背景。ユーザーごとに自動で1色が決まる（AvatarFallback の colorSeed）。直接クラスを書かない",
    tokens: [
      { name: "avatar-1", tailwind: "bg-avatar-1 text-avatar-1-foreground", usage: "参照先: gaji-main-700" },
      { name: "avatar-2", tailwind: "bg-avatar-2 text-avatar-2-foreground", usage: "参照先: gaji-main-500" },
      { name: "avatar-3", tailwind: "bg-avatar-3 text-avatar-3-foreground", usage: "参照先: gaji-main-300" },
      { name: "avatar-4", tailwind: "bg-avatar-4 text-avatar-4-foreground", usage: "参照先: gaji-main-100" },
      { name: "avatar-5", tailwind: "bg-avatar-5 text-avatar-5-foreground", usage: "参照先: gaji-accent-700" },
      { name: "avatar-6", tailwind: "bg-avatar-6 text-avatar-6-foreground", usage: "参照先: gaji-accent-200" },
      { name: "avatar-7", tailwind: "bg-avatar-7 text-avatar-7-foreground", usage: "参照先: gaji-accent-100" },
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
  { title: "Red", names: ["red-50", "red-200", "red-400", "red-500", "red-700", "red-800", "red-950"] },
  { title: "Green", names: ["green-50", "green-200", "green-400", "green-500", "green-700", "green-800", "green-950"] },
  { title: "Amber", names: ["amber-50", "amber-200", "amber-400", "amber-700", "amber-800", "amber-900", "amber-950"] },
  { title: "Sky", names: ["sky-200", "sky-400", "sky-800", "sky-950"] },
];

export type BrandColor = {
  /** CSS 変数名 (先頭の -- を除く) */
  name: string;
  hex: string;
  /** Figma の Gaji-Labo Colors に書かれている用途 (Web サイト / ブログでの使われ方) */
  usage: string;
};

/**
 * Gaji-Labo のブランドカラー (Primitive)
 * 出典: Figma「Gaji-Labo Styles」> Gaji-Labo Colors
 *   - Main: Web Site の Main
 *   - Accent: Blog の Accent
 * まだ Semantic トークンには割り当てていない。使うときは Semantic トークンを追加して、その参照先にする
 */
export const brandColors: { title: string; description: string; colors: BrandColor[] }[] = [
  {
    title: "Main",
    description: "落ち着いた青みのグレー。面・背景・区切りに使われている",
    colors: [
      { name: "gaji-main-700", hex: "#7B8A93", usage: "サービス案内タイトル、採用パネルメニュー罫" },
      { name: "gaji-main-500", hex: "#98B5C6", usage: "アイコン" },
      { name: "gaji-main-300", hex: "#CBDAE2", usage: "ボタン hover" },
      { name: "gaji-main-100", hex: "#E6EDF1", usage: "スケジュール table 背景、採用パネルメニュー背景" },
      { name: "gaji-main-50", hex: "#EFF1F2", usage: "ページタイトル背景、table B 背景" },
    ],
  },
  {
    title: "Accent",
    description: "はっきりした青。リンクや操作できる要素を示す",
    colors: [
      { name: "gaji-accent-700", hex: "#0D6BA3", usage: "アイコン、リンク" },
      { name: "gaji-accent-200", hex: "#CFE1ED", usage: "タグ背景色" },
      { name: "gaji-accent-100", hex: "#E6F0F6", usage: "hover" },
    ],
  },
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
