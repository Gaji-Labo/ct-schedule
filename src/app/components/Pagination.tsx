import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  /** 今のページ (1 始まり) */
  page: number;
  /** 全ページ数。1 以下なら何も出さない */
  totalPages: number;
  /** ページ番号から移動先の URL を作る */
  hrefFor: (page: number) => string;
  /** 読み上げ用の名前 (例: 「Issue 一覧のページ」) */
  label?: string;
};

/** 出すページ番号。先頭・末尾・今のページの前後1つを出し、間は「…」(null) にする */
export function pageItems(page: number, totalPages: number): (number | null)[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  // 先頭・末尾の近くにいるときは、ページ番号を5つ並べて「…」が続けて出ないようにする
  if (page <= 3) [2, 3, 4, 5].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [1, 2, 3, 4].forEach((d) => pages.add(totalPages - d));
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push(null);
    items.push(p);
  });
  return items;
}

/**
 * 長い一覧のページ送り。前へ・ページ番号・次へを並べる。
 * 今のページは outline (枠つき) で示し、aria-current="page" を付ける。
 * 端のページでは「前へ」「次へ」を消さずに disabled にする（ボタンの位置が動かないように）。
 * スマホ幅では「前へ」「次へ」の文字を隠し、矢印だけにする（読み上げ用の名前は残る）。
 */
export const Pagination = ({ page, totalPages, hrefFor, label = "ページ送り" }: Props) => {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav aria-label={label} className="flex justify-center">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {prev ? (
            <Button variant="ghost" asChild>
              <a href={hrefFor(prev)} aria-label="前のページ">
                <ChevronLeft />
                <span className="hidden sm:inline">前へ</span>
              </a>
            </Button>
          ) : (
            <Button variant="ghost" disabled aria-label="前のページ">
              <ChevronLeft />
              <span className="hidden sm:inline">前へ</span>
            </Button>
          )}
        </li>
        {pageItems(page, totalPages).map((p, i) =>
          p === null ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-sm text-muted-foreground">
              …
            </li>
          ) : (
            <li key={p}>
              <Button variant={p === page ? "outline" : "ghost"} size="icon" asChild>
                <a
                  href={hrefFor(p)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`${p}ページ目`}
                >
                  {p}
                </a>
              </Button>
            </li>
          ),
        )}
        <li>
          {next ? (
            <Button variant="ghost" asChild>
              <a href={hrefFor(next)} aria-label="次のページ">
                <span className="hidden sm:inline">次へ</span>
                <ChevronRight />
              </a>
            </Button>
          ) : (
            <Button variant="ghost" disabled aria-label="次のページ">
              <span className="hidden sm:inline">次へ</span>
              <ChevronRight />
            </Button>
          )}
        </li>
      </ul>
    </nav>
  );
};
