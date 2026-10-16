import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { createMembers, createSchedules } from "@/src/design-system/mocks/ct";
import { CTScheduleCarousel } from "./CTScheduleCarousel";

const meta = {
  title: "Domain/CTScheduleCarousel",
  component: CTScheduleCarousel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "週ごとの組み合わせカード（`CTScheduleCard`）を並べるカルーセル。`UI/Carousel` を使っている。",
          "",
          "**送りボタンの出し方**",
          "- 初期表示（今週が左端）では右端の「次の週」ボタンだけを出す",
          "- 「次の週」で進めると、左端に「前の週」ボタンが出る。今週まで戻ると再び消える",
          "- 最後の週まで進むと「次の週」ボタンは消える",
          "",
          "ボタンはカードの上下中央で、カードが見切れる左右の端にボタンの中心が来るように置いている。",
          "スワイプ・ドラッグ・左右の矢印キーでも送れる。",
        ].join("\n"),
      },
    },
  },
  args: {
    schedules: createSchedules(createMembers(20), 12),
  },
} satisfies Meta<typeof CTScheduleCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 初期表示。右端の「次の週」ボタンだけが出る */
export const Default: Story = {};

/** 参加人数が少ないとき（カードが短い） */
export const FewMembers: Story = {
  args: { schedules: createSchedules(createMembers(3), 12) },
};

/** 週が少なく、全部が画面に収まるとき（ボタンは出ない） */
export const FitsInView: Story = {
  args: { schedules: createSchedules(createMembers(3), 2) },
};

export const ShouldShowPrevAfterNext: Story = {
  name: "次の週を押すと前の週ボタンが出る",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvas, step }) => {
    const next = await canvas.findByRole("button", { name: "次の週" });

    await step("初期表示では「前の週」が無い", async () => {
      await expect(
        canvas.queryByRole("button", { name: "前の週" }),
      ).not.toBeInTheDocument();
    });

    await step("「次の週」を押すと「前の週」が出る", async () => {
      await userEvent.click(next);
      await expect(
        await canvas.findByRole("button", { name: "前の週" }),
      ).toBeVisible();
    });

    await step("「前の週」で戻ると、再び消える", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: "前の週" }),
      );
      await waitFor(() =>
        expect(
          canvas.queryByRole("button", { name: "前の週" }),
        ).not.toBeInTheDocument(),
      );
    });
  },
};
