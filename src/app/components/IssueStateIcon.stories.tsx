import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ISSUE_STATE_LABEL, IssueStateIcon, type IssueState } from "./IssueStateIcon";

const meta = {
  title: "Apps/Issueトラッカー/Components/IssueStateIcon",
  component: IssueStateIcon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Issue の状態のアイコン。オープン（緑・○に点）、クローズ（完了）（青・○にチェック）、クローズ（対応しない）（灰・○に斜線）。形でも区別でき、読み上げでは状態の文言になる。",
      },
    },
  },
  args: { state: "open" },
} satisfies Meta<typeof IssueStateIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** オープン */
export const Open: Story = {};

/** 3つの状態を文言と並べたもの */
export const AllStates: Story = {
  render: () => (
    <div className="grid gap-2">
      {(Object.keys(ISSUE_STATE_LABEL) as IssueState[]).map((state) => (
        <div key={state} className="flex items-center gap-2 text-sm">
          <IssueStateIcon state={state} />
          <span aria-hidden>{ISSUE_STATE_LABEL[state]}</span>
        </div>
      ))}
    </div>
  ),
};
