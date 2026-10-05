import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SigninWithSlackButton } from "./SigninWithSlackButton";

const meta = {
  title: "Domain/SigninWithSlackButton",
  component: SigninWithSlackButton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Slack でログインするボタン。未ログイン時にヘッダー右端に出る。",
          "",
          "見た目は Slack 公式の「Sign in with Slack」ボタンに合わせているため、`Button` ではなく独自の `<button>` を使っている（既知の違反）。",
          "Storybook では `signIn` をモックしているので、押しても遷移しない。",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof SigninWithSlackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
