import { getUserBySlackId, getUsers } from "@/app/actions";
import { auth } from "@/auth";
import { DeleteMemberDialog } from "@/components/DeleteMemberDialog";
import { Header } from "@/components/Header";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";

export default async function Home() {
  const memberData = await getUsers();
  const session = await auth();
  const user = session?.user?.slack_user_id
    ? await getUserBySlackId(session.user.slack_user_id)
    : null;

  return (
    <main className="grid gap-10 max-w-7xl mx-auto p-10">
      <Header title="メンバー一覧" />
      <section className="grid gap-3">
        {memberData.map((member) => (
          <Fragment key={member.id}>
            <div className="flex gap-3 items-center justify-between px-3">
              <div key={member.id} className="flex gap-2 items-center">
                {member.slack_image && (
                  <Avatar>
                    <AvatarImage
                      src={member.slack_image}
                      alt={`${member.slack_display_name}のアイコン`}
                    />
                  </Avatar>
                )}
                <span className="font-semibold">
                  {member.slack_display_name}
                </span>
                <div className="flex gap-1 items-center text-sm">
                  <div
                    className={`${
                      member.participate ? "bg-green-500" : "bg-gray-200"
                    } h-2 w-2 rounded-full`}
                  />
                  {member.participate ? "参加" : "不参加"}
                </div>
              </div>
              {user && <DeleteMemberDialog member={member} />}
            </div>
            <Separator />
          </Fragment>
        ))}
      </section>
    </main>
  );
}
