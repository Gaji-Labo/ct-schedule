import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteHeader } from "./SiteHeader";

const meta = {
  title: "Domain/SiteHeader",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "ページ最上部の帯。左上に Gaji-Labo のロゴを置き、https://www.gaji.jp/ へのリンクにしている（新しいタブで開く）。",
          "",
          "背景は黒（`bg-site-header`）、ロゴは白抜き（`text-site-header-foreground`）。枠線は付けない。ライト・ダークどちらのテーマでも同じ見た目。中身の幅はページ本体と同じ `max-w-7xl` で揃える。",
          "ページタイトルとログインボタン（`Header`）は、この帯の下の `<main>` に置く。",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
