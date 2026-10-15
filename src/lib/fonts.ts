import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";

/**
 * アプリで使うフォント。DESIGN.md「タイポグラフィ」を参照。
 * - 欧文・数字: Geist
 * - 和文: Noto Sans JP（OS による見た目の差をなくすため Web フォントで読み込む）
 * - 等幅: Geist Mono
 *
 * それぞれ CSS 変数として <html> に付け、tailwind.config.ts の fontFamily から参照する。
 * アプリは src/app/layout.tsx、Storybook は .storybook/preview.tsx で読み込む。
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  // 和文グリフは unicode-range で必要な分だけ読まれる。サイズが大きいので preload はしない
  preload: false,
});

/** <html> に付けるクラス（3つの CSS 変数を定義する） */
export const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  notoSansJP.variable,
].join(" ");
