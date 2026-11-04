/**
 * a11y-check.ts で、直すまで残しておく違反。直したら行を消す（消し忘れると check:a11y が知らせる）。
 *
 * - rule: axe の規則 ID（color-contrast など）
 * - stories: Story ID の前方一致（`ui-badge` なら UI/Badge のすべての Story）
 * - themes: 片方のテーマだけで起きるとき
 * - reason: 残している理由と、直し方の方針
 *
 * トークン同士の組み合わせのコントラストは src/design-system/contrast.test.ts（bun test）で見ている。
 */
export type KnownViolation = {
  rule: string;
  stories: string[];
  themes?: ("light" | "dark")[];
  reason: string;
};

export const KNOWN_VIOLATIONS: KnownViolation[] = [
  {
    rule: "color-contrast",
    stories: ["ui-button--variants", "ui-button--dialog-actions", "ui-dialog--opened"],
    themes: ["light"],
    reason:
      "削除ボタンの白い文字が赤 (red-500) の地で 3.6:1。トークン --destructive を濃い赤にして直す（contrast.test.ts の KNOWN と同じ原因）",
  },
  {
    rule: "color-contrast",
    stories: [
      "apps-ctスケジュール-components-ctschedulecard",
      "apps-ctスケジュール-components-ctschedulecarousel",
      "apps-ctスケジュール-pages-ct組み合わせ表",
    ],
    reason:
      "CTScheduleCard がパレット色を直書きしている（eslint.config.mjs の既知の違反）。お休み・祝日名のラベル (bg-gray-400 に白) と日付 (text-gray-400) が 2.4:1、ダークでは祝日の面 (bg-gray-100) が白いまま。トークン (status-holiday / status-rest) に置き換えて直す",
  },
  {
    rule: "link-name",
    stories: [
      "apps-ctスケジュール-components-ctschedulecard",
      "apps-ctスケジュール-components-ctschedulecarousel",
      "apps-ctスケジュール-pages-ct組み合わせ表",
    ],
    reason:
      "CTScheduleCard のハドルのリンクがアイコンだけで、読み上げる名前が無い。aria-label（「○○ とハドルを開始」など）を付けて直す",
  },
  {
    rule: "target-size",
    stories: ["apps-ctスケジュール-components-ctschedulecarousel", "apps-ctスケジュール-pages-ct組み合わせ表"],
    reason:
      "カルーセルの「次へ」ボタンが、右端に見切れたカードのハドルのボタンに重なる。Story は今日の日付から週を並べるので、どのカードが右端に来るかで出る日と出ない日がある。カルーセルの送りボタンをカードの外に置くか、見切れたカードを操作できないようにして直す",
  },
  {
    rule: "aria-hidden-focus",
    stories: ["ui-dropdownmenu--opened", "ui-dropdownmenu--should-open-menu", "ui-select--should-select-option"],
    reason:
      "メニューを開いている間、Radix がメニューの外 (#storybook-root) に aria-hidden を付け、その中の開くボタンが残る。フォーカスはメニューの中に閉じ込められるので操作では届かない。Radix の挙動として許容する",
  },
  {
    rule: "color-contrast",
    stories: ["ui-sonner--should-show-toast"],
    themes: ["dark"],
    reason:
      "Storybook には next-themes の Provider が無く、Toaster がダークでもライト用の配色になる。sonner のライト用の説明文の色 (#3f3f3f) がトークン (text-muted-foreground) より優先され、暗い地に暗い文字になる。Toaster にテーマを渡すか、説明文の色をトークンで確実に上書きして直す",
  },
];
