import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleCheck, Info } from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { expect, userEvent, within } from "storybook/test";
import type { User } from "@/app/actions";
import { PageHeader, PageLayout, PageSection } from "@/components/PageLayout";
import { UserAvatar } from "@/components/UserAvatar";
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
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { createMember, mockUChannels } from "@/src/design-system/mocks/ct";

/**
 * 差し替えた写真の見本 (本物は利用者がアップロードした画像)。
 * Storybook で「差し替え済み」を見せるためだけの画像なので、色は画像の中に閉じている。
 */
const SAMPLE_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#98B5C6"/><circle cx="48" cy="38" r="18" fill="#E6EDF1"/><ellipse cx="48" cy="92" rx="32" ry="26" fill="#E6EDF1"/></svg>',
  );

/**
 * プロフィールに足す項目。DB (users テーブル) にはまだ無い。
 * 本物を作るときは users にカラムを足し、User 型と updateUser を広げる。
 */
type ProfileExtra = {
  /** 差し替えた写真の URL。無いときは Slack アイコン (slack_image) を出す */
  custom_image?: string;
  /** 一言コメント (任意) */
  comment?: string;
  /** 属性・役職 (任意・自由入力) */
  title?: string;
};

type Profile = User & ProfileExtra;

type PageProps = {
  /** 編集するメンバー */
  profile: Profile;
  /** 管理者が他人のプロフィールを開いている (/member/[id]/edit。仮置き) */
  editingOther: boolean;
  /** 保存中 (保存ボタンを押した直後) */
  saving: boolean;
};

const MEMBER_LIST_ID = "apps-ctスケジュール-pages-メンバー一覧--default";
const TOP_ID = "apps-ctスケジュール-pages-ct組み合わせ表--default";

/** 任意の項目に付けるラベル (Label ガイドライン「必須・任意は文字で示す」) */
const FieldLabel = ({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: string;
  required?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <Label htmlFor={htmlFor}>{children}</Label>
    <Badge variant="secondary">{required ? "必須" : "任意"}</Badge>
  </div>
);

/**
 * プロフィール編集ページ（本番では /profile。管理者が他人を直すときは /member/[id]/edit）の見た目を、
 * モックデータで再現したもの。保存はサーバーアクションにつながるので、ここでは保存したふりをして toast を出すだけ。
 */
const ProfilePage = ({ profile, editingOther, saving: initialSaving }: PageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customImage, setCustomImage] = useState(profile.custom_image);
  const [saving, setSaving] = useState(initialSaving);
  const name = profile.slack_display_name ?? "";

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setCustomImage(URL.createObjectURL(file));
    event.target.value = "";
  };

  // 本物は updateUser (サーバーアクション) に写真・一言コメント・属性・役職を足したもの
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(
        editingOther ? `${name} のプロフィールを保存しました` : "プロフィールを保存しました",
      );
    }, 800);
  };

  return (
    <PageLayout>
      <PageHeader
        title="プロフィール編集"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                {/* 本物は next/link で / へ */}
                <BreadcrumbLink href={`/?path=/story/${TOP_ID}`} target="_top">
                  CT組み合わせ表
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {editingOther && (
                <>
                  <BreadcrumbItem>
                    {/* 本物は next/link で /member へ */}
                    <BreadcrumbLink href={`/?path=/story/${MEMBER_LIST_ID}`} target="_top">
                      メンバー一覧
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>プロフィール編集</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        // 本物は UserDropdown (ログイン中の自分のアバター)
        actions={<UserAvatar user={createMember(0)} />}
      />

      {editingOther && (
        <Alert variant="info">
          <Info aria-hidden />
          <AlertTitle>{name} のプロフィールを編集しています</AlertTitle>
          <AlertDescription>管理者として、ほかのメンバーのプロフィールを変更します。</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid max-w-xl gap-10">
        <PageSection title="写真">
          <div className="flex flex-wrap items-center gap-4">
            <UserAvatar
              size="lg"
              user={{
                slack_display_name: profile.slack_display_name,
                slack_user_id: profile.slack_user_id,
                slack_image: customImage || profile.slack_image,
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                id="photo"
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={handlePhotoChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                写真を変更
              </Button>
              {customImage && (
                <Button type="button" variant="ghost" onClick={() => setCustomImage(undefined)}>
                  Slack のアイコンに戻す
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {customImage
              ? "差し替えた写真を表示しています。保存すると反映されます。"
              : "Slack のアイコンを表示しています。"}
          </p>
        </PageSection>

        <PageSection title="基本情報">
          <div className="grid gap-2">
            <FieldLabel htmlFor="displayName" required>
              表示名
            </FieldLabel>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={profile.slack_display_name}
              required
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor="title">属性・役職</FieldLabel>
            <Input
              id="title"
              name="title"
              defaultValue={profile.title}
              placeholder="例: エンジニア / チームリーダー"
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor="comment">一言コメント</FieldLabel>
            <Input
              id="comment"
              name="comment"
              defaultValue={profile.comment}
              placeholder="例: 最近はキャンプにはまっています"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              CT の相手があなたを知る手がかりになります。
            </p>
          </div>
        </PageSection>

        <PageSection title="CT の設定">
          <div className="grid gap-2">
            <FieldLabel htmlFor="slackUChannelId" required>
              uチャンネル
            </FieldLabel>
            <Select name="slackUChannelId" defaultValue={profile.slack_u_channel_id} required>
              <SelectTrigger id="slackUChannelId">
                <SelectValue placeholder="uチャンネルを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {mockUChannels.map((channel) => (
                    <SelectItem value={channel.id} key={channel.id}>
                      {channel.name_normalized}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CT の組み合わせを Slack で知らせるとき、名前と一緒に載ります。
            </p>
          </div>
          <div className="grid gap-2">
            <FieldLabel htmlFor="employeeNumber" required>
              社員番号
            </FieldLabel>
            <Input
              id="employeeNumber"
              name="employeeNumber"
              type="number"
              defaultValue={profile.employee_number}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="participate" name="participate" defaultChecked={profile.participate} />
            <Label htmlFor="participate">CTに参加する</Label>
          </div>
        </PageSection>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner aria-hidden /> : <CircleCheck aria-hidden />}
            {saving ? "保存中" : "保存する"}
          </Button>
        </div>
      </form>

      {/* 本物は app/layout.tsx に1つ置いてある */}
      <Toaster position="top-center" />
    </PageLayout>
  );
};

const me: Profile = {
  ...createMember(0),
  title: "エンジニア",
  comment: "最近はキャンプにはまっています。おすすめの道具を教えてください",
};

const meta = {
  title: "Drafts/CTスケジュール/プロフィール編集",
  component: ProfilePage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "プロフィール編集ページ（本番の予定パスは /profile。管理者が他人を直すときは /member/[id]/edit で仮置き）をモックデータで再現した確認待ちの画面。ヘッダーのユーザーメニューから開き、写真・表示名・属性・役職・一言コメント・uチャンネル・社員番号・CT への参加を設定する。写真は Slack のアイコンが既定で、差し替えたあとも Slack のアイコンに戻せる。保存はサーバーアクション（本物は updateUser）の代わりに、保存したふりをして toast を出す。",
      },
    },
  },
  args: {
    profile: me,
    editingOther: false,
    saving: false,
  },
} satisfies Meta<typeof ProfilePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 本人がログインして開いた状態。写真は Slack のアイコンのまま、一言コメントと属性・役職は入力済み */
export const Default: Story = {};

/** 初めて開いた状態。任意の項目（属性・役職、一言コメント）が空で、uチャンネルも未選択 */
export const FirstTime: Story = {
  args: {
    profile: { ...createMember(0), slack_u_channel_id: undefined },
  },
};

/** 写真を差し替えた状態。「Slack のアイコンに戻す」が出る */
export const CustomPhoto: Story = {
  args: { profile: { ...me, custom_image: SAMPLE_PHOTO } },
};

/** 差し替えた写真を「Slack のアイコンに戻す」で元に戻した状態 (CustomPhoto から操作する) */
export const RevertPhoto: Story = {
  args: CustomPhoto.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Slack のアイコンに戻す" }));
    await expect(
      canvas.queryByRole("button", { name: "Slack のアイコンに戻す" }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText("Slack のアイコンを表示しています。")).toBeInTheDocument();
  },
};

/** 管理者がメンバー一覧からほかのメンバーを開いた状態（/member/[id]/edit。仮置き） */
export const EditingOther: Story = {
  args: {
    editingOther: true,
    profile: { ...createMember(4), title: "デザイナー", comment: "よろしくお願いします" },
  },
};

/** 表示名・属性・役職・一言コメントが長い */
export const LongText: Story = {
  args: {
    profile: {
      ...me,
      slack_display_name: "yamada-taro-design-and-engineering-team",
      title: "プロダクトデザイナー / フロントエンドエンジニア / デザインシステムチームリーダー",
      comment:
        "最近はキャンプと料理にはまっています。週末は子どもと公園に行くことが多いです。CT では仕事以外の話もたくさんしたいです",
    },
  },
};

/** 保存ボタンを押した直後。ボタンが押せなくなり、Spinner が出る */
export const Saving: Story = {
  args: { saving: true },
};
