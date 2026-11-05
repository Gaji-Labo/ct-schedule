import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/src/lib/utils";

/**
 * ラベルの色。Badge の variant から選ぶ（任意の色は使えない）。
 * ラベルを作るときに、意味の近いものを1つ選んでおく。
 * - destructive: 不具合・障害（bug など）
 * - warning: 対応が要る・振り分け待ち（needs-triage など）
 * - info: 要望・改善（enhancement など）
 * - success: 歓迎・取り組みやすい（good first issue など）
 * - secondary / outline: 色の意味を持たせない分類（documentation、question など）
 */
export type IssueLabelColor = "destructive" | "warning" | "info" | "success" | "secondary" | "outline";

export type IssueLabelData = {
  name: string;
  color: IssueLabelColor;
};

type Props = {
  label: IssueLabelData;
  /** 押したときの移動先（そのラベルで絞り込んだ一覧） */
  href: string;
};

/**
 * Issue のラベル。押すとそのラベルで一覧を絞り込む。
 * 見た目は Badge と同じ色の組み合わせ（badgeVariants）で、押せることが分かるよう hover で下線を出す。
 * Badge（div・見るだけ）とは別の部品にしているのは、Badge のガイドラインで「押せる要素に使わない」としているため。
 */
export const IssueLabel = ({ label, href }: Props) => (
  <a
    href={href}
    className={cn(
      badgeVariants({ variant: label.color }),
      "whitespace-nowrap rounded-full font-medium hover:underline focus-visible:ring-offset-0",
    )}
  >
    <span className="sr-only">ラベル: </span>
    {label.name}
  </a>
);
