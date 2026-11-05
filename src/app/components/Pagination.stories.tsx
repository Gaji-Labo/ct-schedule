import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pagination } from "./Pagination";

const meta = {
  title: "UI/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "長い一覧（1ページに決まった件数ずつ出すもの）のページ送り。一覧のすぐ下に置く。",
          "",
          "- 先頭・末尾・今のページの前後を出し、間は「…」で省く",
          "- 今のページは `Button variant=\"outline\"` と `aria-current=\"page\"` で示す",
          "- 端では「前へ」「次へ」を消さずに disabled にする",
          "- 移動先は `hrefFor` で URL にする（リンクなので、新しいタブで開ける・戻るボタンで戻れる）",
        ].join("\n"),
      },
    },
  },
  args: {
    page: 1,
    totalPages: 42,
    hrefFor: (page: number) => `#page=${page}`,
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 1ページ目（「前へ」は disabled） */
export const FirstPage: Story = {};

/** 途中のページ（前後に「…」） */
export const MiddlePage: Story = { args: { page: 20 } };

/** 最後のページ（「次へ」は disabled） */
export const LastPage: Story = { args: { page: 42 } };

/** ページが少ない（「…」は出ない） */
export const FewPages: Story = { args: { page: 2, totalPages: 3 } };
