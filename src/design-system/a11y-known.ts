import type { A11yParameters } from "@storybook/addon-a11y";

/**
 * 直すまで残す、部品の既知の a11y 違反（bun run test:stories の axe で止める規則）。
 * 部品を使う Story は、ここから読み込んで `parameters: { a11y: { config: { rules } } }` に渡す。
 * 部品やトークンを直したら、ここから消す（使う側の Story は書き換えなくてよい）。
 *
 * 新しく作った Story の違反はここに足さず、Story の側で直す（Skill implement-ui「5. 検証する」）。
 * トークン同士のコントラストは src/design-system/contrast.test.ts の KNOWN で見ている。
 */
type A11yRules = NonNullable<NonNullable<A11yParameters["config"]>["rules"]>;

/** 削除ボタン（Button の variant="destructive"）。使う Story: UI/Button, UI/Dialog */
export const destructiveButtonKnown: A11yRules = [
  // 白い文字が赤 (red-500) の地で 3.6:1。削除ボタンだけを外し、ほかの要素のコントラストは見続ける。
  // トークン --destructive を濃い赤にしたら消す
  { id: "color-contrast", selector: "*:not(.bg-destructive)" },
];

/** CTScheduleCard。使う Story: CTScheduleCard, CTScheduleCarousel, CT組み合わせ表 */
export const ctScheduleCardKnown: A11yRules = [
  // パレット色の直書き（eslint.config.mjs の既知の違反）。お休み・祝日名のラベル (bg-gray-400 に白) と日付 (text-gray-400) が 2.4:1。
  // トークン (status-holiday / status-rest) に置き換えたら消す
  { id: "color-contrast", enabled: false },
  // ハドルのリンクがアイコンだけで、読み上げる名前が無い。aria-label（「○○ とハドルを開始」など）を付けたら消す
  { id: "link-name", enabled: false },
];

/** CTScheduleCarousel（中の CTScheduleCard の分も含む）。使う Story: CTScheduleCarousel, CT組み合わせ表 */
export const ctScheduleCarouselKnown: A11yRules = [
  ...ctScheduleCardKnown,
  // 「次へ」ボタンが、右端に見切れたカードのハドルのボタンに重なる。週は今日の日付から並ぶので、出る日と出ない日がある。
  // 送りボタンをカードの外に置くか、見切れたカードを操作できないようにしたら消す
  { id: "target-size", enabled: false },
];

/** Radix のメニュー・リスト（DropdownMenu, Select）。使う Story: UI/DropdownMenu, UI/Select の開閉を試す Story */
export const radixPopupKnown: A11yRules = [
  // 開いている間（閉じた直後も）、Radix が外側に aria-hidden を付け、その中に開くボタンが残る。
  // フォーカスは中に閉じ込められるので、操作では届かない。Radix の挙動として許容する
  { id: "aria-hidden-focus", enabled: false },
];
