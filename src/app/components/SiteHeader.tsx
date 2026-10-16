import { GajiLaboLogo } from "@/components/GajiLaboLogo";

/**
 * ページ最上部の帯。黒地 (site-header) に、左上に白抜きの Gaji-Labo ロゴを置く。
 * ページタイトルやログインボタン (Header) はこの下の <main> 内に置く。
 */
export const SiteHeader = () => (
  <header className="bg-site-header text-site-header-foreground">
    <div className="mx-auto flex max-w-7xl items-center justify-start px-10 py-4">
      <a
        href="https://www.gaji.jp/"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-site-header-foreground"
      >
        <GajiLaboLogo className="h-6" title="Gaji-Labo（新しいタブで開く）" />
      </a>
    </div>
  </header>
);
