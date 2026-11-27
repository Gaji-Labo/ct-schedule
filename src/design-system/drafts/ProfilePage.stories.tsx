import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleAlert, Info } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { User } from "@/app/actions";
import { PageHeader, PageLayout, PageSection } from "@/components/PageLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/sonner";
import { createMember } from "@/src/design-system/mocks/ct";

/** CT組み合わせ表（Storybook 内のリンク先。本物は next/link で / へ） */
const SCHEDULE_HREF = "/?path=/story/apps-ctスケジュール-pages-ct組み合わせ表--default";

/** uチャンネルの選択肢（本物は Slack API の getChannels） */
const createChannels = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `C${String(i + 1).padStart(4, "0")}`,
    name_normalized: `u-${createMember(i).slack_display_name}`,
  }));

/** 必須の項目のラベル。必須は文字（Badge）で示す（UI/Label「ガイドライン」） */
const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: string }) => (
  <div className="flex items-center gap-2">
    <Label htmlFor={htmlFor}>{children}</Label>
    <Badge variant="secondary">必須</Badge>
  </div>
);

type PageProps = {
  /** ログイン中なら編集フォーム、未ログインならログインを促すお知らせを出す */
  signedIn: boolean;
  /** ログインしている本人 */
  user: User;
  /** uチャンネルの選択肢の数 */
  channelCount: number;
  /** 「保存」を押したときの結果（本物は updateUser の成否） */
  saveResult: "success" | "error";
  /** 保存中の状態で開く（送信中の見た目を確かめる用） */
  saving?: boolean;
};

/**
 * プロフィール編集ページ（本番の予定パス: /profile）を、モックデータで再現したもの。
 * フォームの部品は本物を使い、保存の処理だけ代用品にしている（本物は Server Action の updateUser）。
 */
const ProfilePage = ({ signedIn, user, channelCount, saveResult, saving = false }: PageProps) => {
  const [submitting, setSubmitting] = useState(saving);
  const channels = createChannels(channelCount);

  // 代用品: 本物は updateUser(id, displayName, employeeNumber, participate, uChannelId) を呼び、router.refresh() する
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (saveResult === "success") {
        toast.success("更新しました");
      } else {
        toast.error("更新に失敗しました");
      }
    }, 600);
  };

  return (
    <PageLayout>
      <PageHeader
        title="プロフィール編集"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={SCHEDULE_HREF} target="_top">
                  CT組み合わせ表
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>プロフィール編集</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        // 本物は Header（SigninWithSlackButton / UserDropdown）。メンバー一覧の Story に合わせ、ログイン中は省略
        actions={signedIn ? null : <Button variant="outline">Sign in with Slack</Button>}
      />
      {signedIn ? (
        <PageSection>
          {channels.length === 0 && (
            <Alert variant="destructive" className="max-w-md">
              <CircleAlert aria-hidden />
              <AlertTitle>uチャンネルの一覧を読み込めませんでした</AlertTitle>
              <AlertDescription>時間をおいて再読み込みしてください。</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="grid max-w-md gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <RequiredLabel htmlFor="displayName">名前</RequiredLabel>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  defaultValue={user.slack_display_name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <RequiredLabel htmlFor="employeeNumber">社員番号</RequiredLabel>
                <Input
                  id="employeeNumber"
                  name="employeeNumber"
                  type="number"
                  defaultValue={user.employee_number || undefined}
                  required
                />
              </div>
              <div className="grid gap-2">
                <RequiredLabel htmlFor="slackUChannelId">uチャンネル</RequiredLabel>
                <Select
                  required
                  name="slackUChannelId"
                  defaultValue={user.slack_u_channel_id || undefined}
                >
                  <SelectTrigger id="slackUChannelId">
                    <SelectValue placeholder="uチャンネルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {channels.map((channel) => (
                        <SelectItem value={channel.id} key={channel.id}>
                          {channel.name_normalized}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="participate"
                    name="participate"
                    defaultChecked={user.participate}
                    aria-describedby="participate-description"
                  />
                  <Label htmlFor="participate">CTに参加する</Label>
                </div>
                <p
                  id="participate-description"
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  チェックを外すと、CT組み合わせ表の組み合わせから外れます。
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting && <Spinner aria-label="保存中" />}
                保存
              </Button>
              {/* キャンセルは保存せずに CT組み合わせ表へ戻る（遷移なのでリンク） */}
              <Button variant="outline" asChild>
                <a href={SCHEDULE_HREF} target="_top">
                  キャンセル
                </a>
              </Button>
            </div>
          </form>
        </PageSection>
      ) : (
        <PageSection>
          <Alert variant="info">
            <Info aria-hidden />
            <AlertTitle>ログインしていません</AlertTitle>
            <AlertDescription>
              プロフィールを編集するには、右上の「Sign in with Slack」から Slack でログインしてください。
            </AlertDescription>
          </Alert>
        </PageSection>
      )}
      <Toaster position="top-center" />
    </PageLayout>
  );
};

const meta = {
  title: "Drafts/CTスケジュール/プロフィール編集",
  component: ProfilePage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "本人が自分のプロフィール（名前・社員番号・uチャンネル・CT への参加）を直す画面。本番の予定パスは /profile で、ヘッダーのアバターのメニューの「編集」から開く。今のダイアログ（UserDropdown の「プロフィール編集」）を専用ページにしたもの。要件は docs/design/apps/ct-schedule/screens/profile.md。",
      },
    },
  },
  argTypes: {
    channelCount: { control: { type: "range", min: 0, max: 40, step: 1 } },
    saveResult: { control: "inline-radio", options: ["success", "error"] },
  },
  args: {
    signedIn: true,
    user: createMember(0),
    channelCount: 20,
    saveResult: "success",
  },
} satisfies Meta<typeof ProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ログイン中。今の値（名前・社員番号・uチャンネル・CTに参加する）が入った状態で開いたところ */
export const Default: Story = {};

/** 保存に成功した。「更新しました」と出て、そのページに残る */
export const Saved: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("名前")).toHaveValue("yamada");
    await userEvent.click(canvas.getByRole("button", { name: "保存" }));
    await waitFor(() =>
      expect(within(document.body).getByText("更新しました")).toBeInTheDocument(),
    );
  },
};

/** 保存中。「保存」が押せなくなり、Spinner が出る */
export const Saving: Story = {
  args: { saving: true },
};

/** 保存に失敗した。「更新に失敗しました」と出て、入力した値は残る */
export const SaveError: Story = {
  args: { saveResult: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "保存" }));
    await waitFor(() =>
      expect(within(document.body).getByText("更新に失敗しました")).toBeInTheDocument(),
    );
  },
};

/** CT に参加していない人が開いた（「CTに参加する」がオフ） */
export const NotParticipating: Story = {
  args: { user: createMember(1, { participate: false }) },
};

/** 社員番号と uチャンネルがまだ入っていない */
export const Unset: Story = {
  args: {
    user: createMember(2, {
      employee_number: 0,
      slack_u_channel_id: "",
    }),
  },
};

/** 名前が長い・uチャンネルの選択肢が多い */
export const LongName: Story = {
  args: {
    user: createMember(3, {
      slack_display_name: "suzuki-ichiro-frontend-engineer-design-system-team",
    }),
    channelCount: 40,
  },
};

/** ログインしていない状態。フォームは出さず、ログインを促す */
export const SignedOut: Story = {
  args: { signedIn: false },
};

/** uチャンネルの一覧（Slack API）を読み込めなかった。フォームの上にエラーを出す */
export const ChannelsUnavailable: Story = {
  args: { channelCount: 0 },
};
