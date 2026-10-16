import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { cn } from "@/src/lib/utils";

/**
 * ページの骨組み。docs/design/rules.md「レイアウト」のルールをそのまま部品にしたもの。
 * 画面ごとに <main> の余白・最大幅・間隔を書かず、必ずこれを使う。
 *
 * - 最上部に SiteHeader（黒い帯）
 * - <main>: 最大幅 max-w-7xl (1280px) で中央寄せ
 *   余白はスマホ px-4 py-8 (16px / 32px)、md (768px) 以上は p-10 (40px)
 * - 子要素（PageHeader と PageSection）同士の間隔は gap-10 (40px)
 *
 * grid-cols-1 (= minmax(0, 1fr)) にしているのは、横に長いカルーセルなどが
 * 列幅を押し広げてページが横スクロールしないようにするため。
 */
export const PageLayout = ({ children }: { children: ReactNode }) => (
  <>
    <SiteHeader />
    <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-8 md:p-10">
      {children}
    </main>
  </>
);

type PageHeaderProps = {
  /** ページタイトル (h1) */
  title: ReactNode;
  /** 2階層目以降のページでは Breadcrumb を渡す。タイトルのすぐ上に出る */
  breadcrumb?: ReactNode;
  /** タイトルの右端に置く操作（ログインボタン・ユーザーメニューなど） */
  actions?: ReactNode;
};

/**
 * ページの見出しまわり。パンくず → タイトル (h1) と右端の操作。
 * パンくずとタイトルの間隔は gap-2 (8px)。
 */
export const PageHeader = ({ title, breadcrumb, actions }: PageHeaderProps) => (
  <div className="grid gap-2">
    {breadcrumb}
    <div className="flex items-center justify-between gap-10">
      <h1 className="text-2xl font-bold leading-snug">{title}</h1>
      {actions}
    </div>
  </div>
);

type PageSectionProps = {
  /** セクションの見出し (h2)。無くてもよい */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * ページ内のまとまり。セクションの中の要素同士の間隔は gap-4 (16px)。
 * セクション同士の間隔は PageLayout の gap-10 で決まるので、ここでは外側の余白を付けない。
 */
export const PageSection = ({ title, children, className }: PageSectionProps) => (
  <section className={cn("grid grid-cols-1 gap-4", className)}>
    {title && <h2 className="text-lg font-semibold leading-snug">{title}</h2>}
    {children}
  </section>
);
