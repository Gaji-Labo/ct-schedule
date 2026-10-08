import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

/**
 * 元: shadcn-storybook-registry (radix/breadcrumb-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "今いるページの位置を、上の階層から順に示すナビゲーション（パンくずリスト）。",
          "",
          "**使い方**",
          "- ページタイトル（h1）のすぐ上に置く。タイトルとの間は `grid gap-2`",
          "- 上の階層は `BreadcrumbLink`、今いるページは最後に `BreadcrumbPage`（リンクにしない）",
          "- アプリ内のリンクは `BreadcrumbLink asChild` で `next/link` の `Link` を包む",
          "- 区切りは `BreadcrumbSeparator`（既定は「>」のアイコン）",
          "",
          "**使い分け**: トップページ（CT組み合わせ表）には付けない。2階層目以降のページに付ける。",
        ].join("\n"),
      },
    },
  },
  render: (args) => (
    <Breadcrumb {...args}>
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
  ),
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 2階層（このアプリでの使い方） */
export const Default: Story = {};

/** 3階層以上 */
export const Deep: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">CT組み合わせ表</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">メンバー一覧</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>山田</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** 階層が深いときは途中を省略する */
export const WithEllipsis: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">CT組み合わせ表</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>山田</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** 区切りを変える例（スラッシュ） */
export const CustomSeparator: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">CT組み合わせ表</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>メンバー一覧</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
