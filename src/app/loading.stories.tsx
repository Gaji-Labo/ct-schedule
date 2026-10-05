import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Loading from "./loading";

const meta = {
  title: "Pages/Loading",
  component: Loading,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ページの読み込み中（`app/loading.tsx`）。データ取得が終わるまで、画面中央に Spinner を出す。",
      },
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
