import { getUserBySlackId, getUsers } from "@/app/actions";
import { auth } from "@/auth";
import { DeleteMemberDialog } from "@/components/DeleteMemberDialog";
import { Header } from "@/components/Header";
import { MemberGroup } from "@/components/MemberGroup";
import { PageLayout } from "@/components/PageLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const user = session?.user?.slack_user_id
    ? await getUserBySlackId(session.user.slack_user_id)
    : null;

  const memberData = await getUsers();
  // メンバー = Slack 連携で登録された社員全員。参加者 = そのうち CT に参加している人
  const participants = memberData.filter((member) => member.participate);
  const nonParticipants = memberData.filter((member) => !member.participate);
  const renderAction = user
    ? (member: (typeof memberData)[number]) => <DeleteMemberDialog member={member} />
    : undefined;

  return (
    <PageLayout>
      <Header
        title="メンバー一覧"
        user={user}
        session={session}
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">CT組み合わせ表</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>メンバー一覧</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <MemberGroup
        label="参加"
        members={participants}
        emptyText="CTに参加しているメンバーはいません"
        renderAction={renderAction}
      />
      <MemberGroup
        label="不参加"
        members={nonParticipants}
        emptyText="不参加のメンバーはいません"
        renderAction={renderAction}
      />
    </PageLayout>
  );
}
