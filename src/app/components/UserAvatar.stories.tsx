import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { currentUser, longNameUser } from "@/src/stories/fixtures";
import { UserAvatar } from "./UserAvatar";

const sampleImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#94a3b8"/><circle cx="20" cy="16" r="7" fill="#f8fafc"/><rect x="8" y="26" width="24" height="14" rx="7" fill="#f8fafc"/></svg>',
)}`;

const meta = {
  title: "Domain/UserAvatar",
  component: UserAvatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "ユーザーのアイコン。Slack のプロフィール画像を出し、無ければ名前の頭文字を出す。",
          "",
          "- `alt` は「〇〇のアイコン」で自動的に付く",
          "- `fallbackSrc`: DB に画像が無いとき、代わりに使う画像（ログイン中のセッション画像など）",
          "- 大きさは `Avatar` と同じ `sm` / `default` / `lg`",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
  },
  args: { user: currentUser },
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Slack 画像なし。頭文字を表示する */
export const Default: Story = {};

export const WithImage: Story = {
  args: { user: { ...currentUser, slack_image: sampleImage } },
};

/** DB に画像が無いときは fallbackSrc を使う */
export const WithFallbackSrc: Story = {
  args: { fallbackSrc: sampleImage },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <UserAvatar {...args} size="sm" />
      <UserAvatar {...args} size="default" />
      <UserAvatar {...args} size="lg" />
    </div>
  ),
};

/** 名前が無いユーザーは「?」を出す */
export const NoName: Story = {
  args: { user: { slack_display_name: undefined, slack_image: undefined } },
};

/** 長い名前でも頭文字1文字だけを出す */
export const LongName: Story = {
  args: { user: longNameUser },
};
