import { getUserBySlackId, getUsers } from "@/app/actions";
import { auth } from "@/auth";
import { DeleteMemberDialog } from "@/components/DeleteMemberDialog";
import { Header } from "@/components/Header";
import { MemberListItem } from "@/components/MemberListItem";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Fragment } from "react";

export default async function Home() {
  const session = await auth();
  const user = session?.user?.slack_user_id
    ? await getUserBySlackId(session.user.slack_user_id)
    : null;

  const memberData = await getUsers();

  return (
    <>
      <SiteHeader />
      <main className="grid gap-10 max-w-7xl mx-auto p-10">
        <div className="grid gap-2">
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
          <Header title="メンバー一覧" user={user} session={session} />
        </div>
        <section className="grid gap-3">
          {memberData.map((member) => (
            <Fragment key={member.id}>
              <MemberListItem
                member={member}
                action={user && <DeleteMemberDialog member={member} />}
              />
              <Separator />
            </Fragment>
          ))}
        </section>
      </main>
    </>
  );
}
