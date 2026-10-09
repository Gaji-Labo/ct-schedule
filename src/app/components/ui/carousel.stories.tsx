import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

/**
 * 元: shadcn-storybook-registry (radix/carousel-story) を DESIGN.md に合わせて調整
 */
const meta = {
  title: "UI/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "横（または縦）に並べた内容を、ボタン・スワイプ・矢印キーで送るカルーセル。Embla Carousel ベース。",
          "",
          "**構成**: `Carousel` > `CarouselContent` > `CarouselItem`（1枚分）。送りボタンは `CarouselPrevious` / `CarouselNext`。",
          "",
          "**使い方**",
          "- 1枚の幅は `CarouselItem` の `basis-*` で決める（既定は `basis-full` = 1枚ずつ）。中身の幅に任せるなら `basis-auto`",
          "- 送りボタンは既定で外側（左右 48px）に出る。親に余白が無いときは `className` で位置を内側に寄せる",
          "- 端でボタンを消したいときは `autoHide`（既定は disabled で薄く表示）",
          "- 読み上げ用に、何を送るボタンかがわかる `aria-label` を付ける（例: 「次の週」）",
          "",
          "**使い分け**: 全体を一覧で見比べたい内容には使わない（見えない部分の情報に気づきにくい）。",
        ].join("\n"),
      },
    },
  },
  args: {
    className: "w-full max-w-xs",
  },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-card p-6">
              <span className="text-4xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 1枚ずつ送る基本形。端ではボタンが disabled になる */
export const Default: Story = {};

/** `basis-1/3` で3枚ずつ見せる */
export const MultipleItems: Story = {
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {Array.from({ length: 8 }).map((_, index) => (
          <CarouselItem key={index} className="basis-1/3">
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-card p-6">
              <span className="text-2xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

/** `autoHide` で、端ではボタン自体を表示しない */
export const AutoHide: Story = {
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-card p-6">
              <span className="text-4xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious autoHide />
      <CarouselNext autoHide />
    </Carousel>
  ),
};

/** 縦方向 */
export const Vertical: Story = {
  args: { orientation: "vertical", className: "my-12 w-full max-w-xs" },
  render: (args) => (
    <Carousel {...args}>
      <CarouselContent className="h-48">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="basis-1/2">
            <div className="flex h-full items-center justify-center rounded-lg border bg-card p-6">
              <span className="text-2xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const ShouldNavigate: Story = {
  name: "次へ・前へで送れる",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, step }) => {
    const slides = await canvas.findAllByRole("group");
    await expect(slides).toHaveLength(5);
    const next = await canvas.findByRole("button", { name: "次へ" });
    const prev = await canvas.findByRole("button", { name: "前へ" });
    await waitFor(() => expect(prev).toBeDisabled());

    await step("最後まで進む", async () => {
      for (let i = 0; i < slides.length - 1; i++) await userEvent.click(next);
      await waitFor(() => expect(next).toBeDisabled());
    });

    await step("最初まで戻る", async () => {
      for (let i = 0; i < slides.length - 1; i++) await userEvent.click(prev);
      await waitFor(() => expect(prev).toBeDisabled());
    });
  },
};
