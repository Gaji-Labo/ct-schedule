import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GajiLaboLogo } from "@/components/GajiLaboLogo";

const meta = {
  title: "Foundations/Logo",
  component: GajiLaboLogo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Gaji-Labo のロゴ（シンボル＋ロゴタイプ）。出典は https://www.gaji.jp/ のヘッダー・フッターの SVG。",
          "",
          "**使い方**",
          "- コンポーネント: `import { GajiLaboLogo } from \"@/components/GajiLaboLogo\"`",
          "- 画像ファイルとして使う場合: `public/gaji-labo-logo.svg`",
          "- 色は親の文字色（`currentColor`）。通常は `text-foreground` の中に置く。ダークテーマでは自動で白になる",
          "- 大きさは高さで指定する（`h-6` = 24px が標準）。幅は縦横比（734:136）から自動で決まる",
          "- 縦横比を変えない・色を Semantic トークン以外にしない・要素を分解しない",
          "",
          "読み上げ用に `title` を付ける（既定は「Gaji-Labo」）。リンクの中など、周りに同じ文言がある場合は `title=\"\"` で装飾扱いにする。",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    className: {
      control: "select",
      options: ["h-4", "h-6", "h-8", "h-10"],
      description: "高さのクラス",
    },
    title: { control: "text" },
  },
  args: {
    className: "h-6",
  },
} satisfies Meta<typeof GajiLaboLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      {["h-4", "h-6", "h-8", "h-10"].map((h) => (
        <div key={h} className="flex items-center gap-4">
          <span className="w-12 text-xs text-muted-foreground">{h}</span>
          <GajiLaboLogo {...args} className={h} />
        </div>
      ))}
    </div>
  ),
};

/** 背景の上に置く例。色は親の文字色に合わせて変わる */
export const OnSurfaces: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-background p-6 text-foreground">
        <GajiLaboLogo {...args} />
      </div>
      <div className="rounded-lg bg-muted p-6 text-foreground">
        <GajiLaboLogo {...args} />
      </div>
      <div className="rounded-lg bg-primary p-6 text-primary-foreground">
        <GajiLaboLogo {...args} />
      </div>
    </div>
  ),
};
