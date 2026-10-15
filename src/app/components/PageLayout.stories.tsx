import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { PageHeader, PageLayout, PageSection } from "./PageLayout";

/** 骨組みが見えるよう、中身は枠だけの仮の箱にする */
const Placeholder = ({ label, className = "h-32" }: { label: string; className?: string }) => (
  <div
    className={`flex items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground ${className}`}
  >
    {label}
  </div>
);

const meta = {
  title: "Patterns/PageLayout",
  component: PageLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "ページの骨組み。すべての画面はこの3つの部品で組み立てる（`<main>` の余白・最大幅・間隔を画面ごとに書かない）。",
          "",
          "| 部品 | 役割 | 決まっている値 |",
          "| --- | --- | --- |",
          "| `PageLayout` | SiteHeader と `<main>` | 最大幅 `max-w-7xl`（1280px）・中央寄せ。余白はスマホ 16px / 32px（`px-4 py-8`）、`md`（768px）以上 40px（`p-10`）。子要素の間隔 `gap-10`（40px） |",
          "| `PageHeader` | パンくず・タイトル (h1)・右端の操作 | パンくずとタイトルの間 `gap-2`（8px） |",
          "| `PageSection` | ページ内のまとまり（見出し h2 は任意） | 中の要素の間隔 `gap-4`（16px） |",
          "",
          "ブレイクポイントは Tailwind の既定（`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280px）。社内アプリなので PC を基準に作り、`md` 未満でも崩れないことだけを確かめる。",
        ].join("\n"),
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** トップレベルのページ（パンくずなし） */
export const Default: Story = {
  render: () => (
    <PageLayout>
      <PageHeader title="ページタイトル" actions={<Button variant="outline">操作</Button>} />
      <PageSection>
        <Placeholder label="セクションの中身" />
      </PageSection>
      <PageSection>
        <Placeholder label="次のセクション（間隔 40px）" />
      </PageSection>
    </PageLayout>
  ),
};

/** 2階層目以降のページ（タイトルの上にパンくず）と、見出し付きのセクション */
export const WithBreadcrumb: Story = {
  render: () => (
    <PageLayout>
      <PageHeader
        title="メンバー一覧"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">CT組み合わせ表</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>メンバー一覧</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        actions={<Button variant="outline">操作</Button>}
      />
      <PageSection title="セクション見出し (h2)">
        <Placeholder label="中の要素" className="h-16" />
        <Placeholder label="中の要素（間隔 16px）" className="h-16" />
      </PageSection>
      <PageSection title="別のセクション">
        <Placeholder label="中の要素" />
      </PageSection>
    </PageLayout>
  ),
};

/** スマホ幅（md 未満）。余白が 16px / 32px に変わる */
export const Mobile: Story = {
  ...WithBreadcrumb,
  globals: { viewport: { value: "mobile1" } },
};
