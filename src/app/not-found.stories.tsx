import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import NotFound from "./not-found";

const meta = {
  title: "Pages/NotFound",
  component: NotFound,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component: [
          "存在しないページ（`app/not-found.tsx`）。トップへ戻るリンクを出す。",
          "",
          "現状は文言とリンクだけで、レイアウトは未整備。",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
