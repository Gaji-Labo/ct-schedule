import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LABELS } from "@/src/design-system/mocks/issue-tracker";
import { IssueLabel } from "./IssueLabel";

const meta = {
  title: "Apps/Issueトラッカー/Components/IssueLabel",
  component: IssueLabel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Issue のラベル。押すとそのラベルで一覧を絞り込むリンク。",
          "",
          "色は Badge と同じ variant（`destructive` / `warning` / `info` / `success` / `secondary` / `outline`）から選ぶ。任意の色（#d73a4a など）は使わない。",
          "Badge は「見るだけの表示」なので、押せるラベルはこの部品にしている。",
        ].join("\n"),
      },
    },
  },
  args: { label: LABELS.bug, href: "#q=label:bug" },
} satisfies Meta<typeof IssueLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** bug（destructive） */
export const Default: Story = {};

/** 色の一覧 */
export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.values(LABELS).map((label) => (
        <IssueLabel key={label.name} label={label} href={`#q=label:${label.name}`} />
      ))}
    </div>
  ),
};
