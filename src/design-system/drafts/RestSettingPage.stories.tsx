import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, PageLayout, PageSection } from "@/components/PageLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { createMembers, createSchedules } from "@/src/design-system/mocks/ct";
import type { CT } from "@/src/utils/member";
import type { User } from "@/app/actions";

/** 選べる週の数（CT組み合わせ表で送れる範囲に合わせる想定。本番の値は未決） */
const WEEKS = 12;

type WeekOption = {
  date: string;
  /** 選べない理由。選べる週は undefined */
  disabledReason?: string;
};

/** 自分がその週に自動で「お休み」（参加者が奇数で相手がいない）になっているか */
const isAutoRest = (ct: CT, me: User) =>
  ct.round?.some(
    (pair) =>
      (pair[0]?.id === me.id && pair[1] === null) ||
      (pair[1]?.id === me.id && pair[0] === null),
  ) ?? false;

const toWeekOption = (ct: CT, me: User): WeekOption => {
  if (ct.isHoliday) return { date: ct.date, disabledReason: `祝日（${ct.holidayName}）` };
  if (isAutoRest(ct, me)) return { date: ct.date, disabledReason: "もともとお休み" };
  return { date: ct.date };
};

type PageProps = {
  /** 参加者の人数 */
  participants: number;
  /** すでに登録してあるお休みの数（今後の週の先頭から順に、選べる週だけを使う） */
  registeredCount: number;
  /** CT組み合わせ表の週カードから開いたとき、その週が選ばれた状態で開く（週の番号。0 なら選ばれていない） */
  preselectedWeek: number;
  /** ログインしているか */
  signedIn: boolean;
};

/**
 * お休みの設定画面。本番はまだ無い（URL は未決。仮に /rest とする）。
 * お休みの登録・取り消しは本物ではサーバーアクションで DB を更新し、ペアを組み直す（仕組みは未決）。
 * Storybook では画面の中の状態だけを変え、結果を toast で知らせる。
 */
const RestSettingPage = ({
  participants,
  registeredCount,
  preselectedWeek,
  signedIn,
}: PageProps) => {
  const members = createMembers(participants);
  const schedules = createSchedules(members, WEEKS);
  // ログインしている本人。モックでは先頭のメンバー。
  // 参加者が奇数のときは「もともとお休み」の週が見えるよう、来週以降で最初にお休みになる人を本人にする
  const autoRestUser = schedules
    .slice(1)
    .flatMap((ct) => (ct.isHoliday ? [] : (ct.round ?? [])))
    .find((pair) => pair[1] === null)?.[0];
  const me = autoRestUser ?? members[0];
  const weeks = schedules.map((ct) => toWeekOption(ct, me));
  const selectableDates = weeks.filter((w) => !w.disabledReason).map((w) => w.date);

  const [registered, setRegistered] = useState<string[]>(() =>
    selectableDates.slice(0, registeredCount),
  );
  // 週カードから開いたときは、その週を選んだ状態にする（祝日など選べない週なら選ばない）
  const [selected, setSelected] = useState<string | undefined>(() => {
    const week = preselectedWeek > 0 ? weeks[preselectedWeek - 1] : undefined;
    return week && !week.disabledReason && !registered.includes(week.date) ? week.date : undefined;
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const register = () => {
    if (!selected) return;
    // 本物はサーバーアクションで登録し、ペアを組み直す
    setRegistered((prev) => weeks.map((w) => w.date).filter((d) => prev.includes(d) || d === selected));
    toast.success(`${selected} をお休みにしました`);
    setSelected(undefined);
  };

  const cancel = (date: string) => {
    // 本物はサーバーアクションで取り消し、ペアを組み直す
    setRegistered((prev) => prev.filter((d) => d !== date));
    toast.success(`${date} のお休みを取り消しました`);
  };

  return (
    <PageLayout>
      <Toaster position="top-center" />
      <PageHeader
        title="お休みの設定"
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
                <BreadcrumbPage>お休みの設定</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        // 本物は UserDropdown / SigninWithSlackButton
        actions={
          signedIn ? (
            <UserAvatar user={me} />
          ) : (
            <Button variant="outline">Sign in with Slack</Button>
          )
        }
      />

      {!signedIn ? (
        <Alert variant="info">
          <AlertDescription className="leading-relaxed">
            お休みを設定するには、Slack でログインしてください。
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <PageSection title="お休みにする週">
            <p className="text-sm leading-relaxed text-muted-foreground">
              CTに参加できない週を選んでください。お休みにすると、その週のペアは組み直されます。
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="grid gap-2 md:w-80">
                <Label htmlFor="rest-week">週（月曜日）</Label>
                <Select value={selected ?? ""} onValueChange={setSelected}>
                  <SelectTrigger id="rest-week">
                    <SelectValue placeholder="週を選ぶ" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeks
                      .filter((w) => !registered.includes(w.date))
                      .map((w) => (
                        <SelectItem key={w.date} value={w.date} disabled={!!w.disabledReason}>
                          {w.disabledReason ? `${w.date} ${w.disabledReason}` : w.date}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={!selected} onClick={() => setConfirmOpen(true)}>
                お休みにする
              </Button>
            </div>
          </PageSection>

          <PageSection title={`登録したお休み（${registered.length}件）`}>
            {registered.length === 0 ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                登録したお休みはありません
              </p>
            ) : (
              <ul className="grid gap-3">
                {registered.map((date) => (
                  <li key={date} className="grid gap-3">
                    <div className="flex items-center justify-between gap-3 px-3">
                      <div className="flex items-center gap-2">
                        <time dateTime={date} className="text-sm font-medium">
                          {date}
                        </time>
                        <Badge variant="secondary">お休み</Badge>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => cancel(date)}>
                        取り消す
                      </Button>
                    </div>
                    <Separator />
                  </li>
                ))}
              </ul>
            )}
          </PageSection>
        </>
      )}

      {/* お休みにすると、その週の自分と相手のペアが組み直される。ほかの人に影響するので確認を挟む */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="confirm">
          <DialogHeader>
            <DialogTitle>お休みにしますか？</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {selected} をお休みにします。この週のペアは組み直されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={register}>お休みにする</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

const meta = {
  title: "Drafts/CTスケジュール/お休みの設定",
  component: RestSettingPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "CTに参加できない週を、本人が手動でお休みにする・取り消す画面（要件: docs/design/apps/ct-schedule/screens/rest-setting.md、Issue #37）。本番にはまだ無い（URL は未決。仮に /rest）。CT組み合わせ表の週カードから開く想定で、そのときは開いた週が選ばれた状態になる。祝日の週と、参加者が奇数で自動でお休みになっている週は選べない。",
      },
    },
  },
  argTypes: {
    participants: { control: { type: "range", min: 2, max: 30, step: 1 } },
    registeredCount: { control: { type: "range", min: 0, max: 10, step: 1 } },
    preselectedWeek: { control: { type: "range", min: 0, max: WEEKS, step: 1 } },
  },
  args: {
    participants: 20,
    registeredCount: 1,
    preselectedWeek: 0,
    signedIn: true,
  },
} satisfies Meta<typeof RestSettingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ログイン中。お休みを1件登録済みで、週はまだ選んでいない */
export const Default: Story = {};

/** CT組み合わせ表の週カードから開いた状態（その週が選ばれていて、すぐ「お休みにする」を押せる） */
export const FromWeekCard: Story = {
  args: { preselectedWeek: 4 },
};

/** 登録したお休みが0件 */
export const NoRest: Story = {
  args: { registeredCount: 0 },
};

/** 登録したお休みが多い（長期の不在など） */
export const ManyRests: Story = {
  args: { registeredCount: 8 },
};

/** 参加人数が奇数（自分が自動でお休みになる週があり、その週は選べない） */
export const OddParticipants: Story = {
  args: { participants: 19 },
};

/** ログインしていない状態 */
export const SignedOut: Story = {
  args: { signedIn: false },
};
