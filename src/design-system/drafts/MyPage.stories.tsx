import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Headphones } from "lucide-react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import type { User } from "@/app/actions";
import { MyPairListItem } from "@/components/MyPairListItem";
import { PageHeader, PageLayout, PageSection } from "@/components/PageLayout";
import { UserAvatar } from "@/components/UserAvatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createMembers, createSchedules } from "@/src/design-system/mocks/ct";
import type { Schedule } from "@/src/utils/member";

/** 「先1ヶ月分くらい」のペアを出す（docs/design/apps/ct-schedule/screens/my-page.md） */
const WEEKS_TO_SHOW = 4;


/** 本物は Slack API (getChannels) から取る u チャンネル。モックではメンバーごとに1つ作る */
type Channel = { id: string; name_normalized: string };
const toChannel = (member: User): Channel => ({
  id: member.slack_u_channel_id,
  name_normalized: `u-${member.slack_display_name}`,
});

type MyPair = {
  date: string;
  partner: User | null;
  holidayName?: string;
};

/** 全員分の組み合わせから、自分が入っている週だけを取り出す */
const pickMyPairs = (schedules: Schedule, me: User): MyPair[] =>
  schedules.flatMap((ct) => {
    if (ct.isHoliday) return [{ date: ct.date, partner: null, holidayName: ct.holidayName }];
    const pair = ct.round?.find((p) => p.some((member) => member?.id === me.id));
    if (!pair) return [];
    const partner = pair[0]?.id === me.id ? pair[1] : pair[0];
    return [{ date: ct.date, partner }];
  });

/**
 * ヘッダー右端のユーザーメニューの代用品。
 * 本物は UserDropdown。今の「編集」を「マイページ」に差し替える想定（アプリの md「主な画面」）
 */
const UserMenu = ({ me }: { me: User }) => (
  <DropdownMenu>
    <DropdownMenuTrigger aria-label="ユーザーメニュー">
      <UserAvatar user={me} />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>{me.slack_display_name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Storybook の画面間移動 (next/link は使えない) */}
        <a href="/?path=/story/drafts-ctスケジュール-マイページ--default" target="_top">
          マイページ
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem>ログアウト</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

/**
 * ハドルを開始するボタン。本物は Slack のハドル URL
 * (https://app.slack.com/huddle/<SLACK_WORKSPACE_ID>/<相手の slack_u_channel_id>) へのリンク
 */
const HuddleButton = ({ partner }: { partner: User }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline" size="icon" asChild>
        <a href="#" aria-label={`${partner.slack_display_name} とハドルを開始`}>
          <Headphones />
        </a>
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>ハドルを開始</p>
    </TooltipContent>
  </Tooltip>
);

/**
 * プロフィール編集フォームの代用品。項目は今の「編集」ダイアログ (UserDropdown) と同じ。
 * 本物はサーバーアクション updateUser で保存する。ここでは保存せず toast だけ出す
 */
const ProfileForm = ({ me, channels }: { me: User; channels: Channel[] }) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("更新しました");
  };

  return (
    <form onSubmit={handleSubmit} className="grid max-w-md grid-cols-1 gap-5">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="displayName">名前</Label>
          <Input
            name="displayName"
            type="text"
            id="displayName"
            defaultValue={me.slack_display_name}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="employeeNumber">社員番号</Label>
          <Input
            name="employeeNumber"
            type="number"
            id="employeeNumber"
            defaultValue={me.employee_number}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slackUChannelId">uチャンネル</Label>
          <Select required name="slackUChannelId" defaultValue={me.slack_u_channel_id}>
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
        <div className="flex items-center gap-2">
          <Checkbox name="participate" id="participate" defaultChecked={me.participate} />
          <Label htmlFor="participate">CTに参加する</Label>
        </div>
      </div>
      <div>
        <Button type="submit">保存</Button>
      </div>
    </form>
  );
};

type PageProps = {
  /** 参加者の人数 */
  participants: number;
  /** 自分が CT に参加しているか */
  participating: boolean;
  /** 自分が直近の週にお休みになるようにする（参加人数が奇数のときだけ効く） */
  restInFirstWeek: boolean;
  /** 2週目を祝日の週にする */
  holidayInSecondWeek: boolean;
  /** 自分と相手の名前を長くする */
  longNames: boolean;
};

/**
 * マイページの画面。ログインしている自分のペア（先1ヶ月分くらい）と、プロフィール編集を1ページに置く。
 * 組み合わせは本番と同じロジック (createSchedules) で作り、自分の入っている週だけを取り出している。
 */
const MyPage = ({
  participants,
  participating,
  restInFirstWeek,
  holidayInSecondWeek,
  longNames,
}: PageProps) => {
  // 末尾の1人は不参加。自分が参加していない状態では、その人を自分にする
  let members = createMembers(participants, 1);
  // u チャンネル名は長い名前にしない (本物も u-<ハンドル名> の短い名前)
  const channels = members.map(toChannel);
  if (longNames) {
    members = members.map((member) => ({
      ...member,
      slack_display_name: `${member.slack_display_name}（デザイン部・フロントエンドチーム兼務）`,
    }));
  }

  let schedules = createSchedules(members, WEEKS_TO_SHOW);
  if (holidayInSecondWeek && schedules[1]) {
    schedules = schedules.map((ct, index) =>
      index === 1 ? { ...ct, round: null, isHoliday: true, holidayName: "勤労感謝の日" } : ct,
    );
  }

  const me = participating
    ? (restInFirstWeek && schedules[0]?.round?.find((pair) => pair[1] === null)?.[0]) ||
      members[0]
    : members[members.length - 1];
  const myPairs = participating ? pickMyPairs(schedules, me) : [];

  return (
    <>
      <PageLayout>
        <PageHeader
          title="マイページ"
          breadcrumb={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {/* Storybook 内では「Apps/CTスケジュール/Pages/CT組み合わせ表」へ移動する (本物は next/link で / へ) */}
                  <BreadcrumbLink
                    href="/?path=/story/apps-ctスケジュール-pages-ct組み合わせ表--default"
                    target="_top"
                  >
                    CT組み合わせ表
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>マイページ</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          actions={<UserMenu me={me} />}
        />
        <PageSection title="自分のペア">
          {!participating ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              CTに参加していないため、ペアはありません。参加するには、下のプロフィールで「CTに参加する」にチェックを入れて保存してください
            </p>
          ) : myPairs.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              参加者が2人以上になると、ペアが組まれます
            </p>
          ) : (
            <div className="grid max-w-2xl grid-cols-1 gap-2">
              {myPairs.map((pair, index) => (
                <MyPairListItem
                  key={pair.date}
                  date={pair.date}
                  partner={pair.partner}
                  holidayName={pair.holidayName}
                  current={index === 0}
                  action={pair.partner && !pair.holidayName && <HuddleButton partner={pair.partner} />}
                />
              ))}
            </div>
          )}
        </PageSection>
        <PageSection title="プロフィール">
          <ProfileForm me={me} channels={channels} />
        </PageSection>
      </PageLayout>
      <Toaster />
    </>
  );
};

const meta = {
  title: "Drafts/CTスケジュール/マイページ",
  component: MyPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "マイページ（本番のパスは未決）。ヘッダーのアイコンから開くメニューの「マイページ」から来る。ログインしている自分のペアを先1ヶ月分（4週）だけ並べ、同じページでプロフィール（名前・社員番号・uチャンネル・CTに参加する）を編集できる。要件は docs/design/apps/ct-schedule/screens/my-page.md。",
      },
    },
  },
  argTypes: {
    participants: { control: { type: "range", min: 0, max: 30, step: 1 } },
  },
  args: {
    participants: 20,
    participating: true,
    restInFirstWeek: false,
    holidayInSecondWeek: false,
    longNames: false,
  },
} satisfies Meta<typeof MyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ログイン中・CT に参加中（参加者20人）。直近の週の行が枠線で目立ち、相手のいる週にはハドルを開始するボタンがある */
export const Default: Story = {};

/** 参加人数が奇数で、直近の週が自分のお休み */
export const RestWeek: Story = {
  args: { participants: 19, restInFirstWeek: true },
};

/** 期間内に祝日の週がある */
export const HolidayWeek: Story = {
  args: { holidayInSecondWeek: true },
};

/** 自分が CT に参加していない（ペアは出ない） */
export const NotParticipating: Story = {
  args: { participating: false },
};

/** 参加者が自分だけ（組み合わせが作れない） */
export const NoPairs: Story = {
  args: { participants: 1 },
};

/** 自分と相手の名前が長い */
export const LongNames: Story = {
  args: { longNames: true },
};
