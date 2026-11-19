import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables } from "@/src/lib/fonts";

export const metadata: Metadata = {
  title: "CT組み合わせ表",
  description: "毎週月曜14:00〜実施のCT組み合わせ一覧",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // フォントの CSS 変数は <html> に付ける（tailwind の font-sans が html 要素で解決されるため）
    <html lang="ja" className={fontVariables}>
      <body className="antialiased">
        <TooltipProvider>
          {children}
          {/* 保存・削除などの操作後に表示されるToast */}
          <Toaster position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
