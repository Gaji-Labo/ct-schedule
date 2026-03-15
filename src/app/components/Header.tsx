import { getUserBySlackId } from "@/app/actions";
import { auth } from "@/auth";
import { SigninWithSlackButton } from "@/components/SigninWithSlackButton";
import { UserDropdown } from "@/components/UserDropdown";
import { getChannels } from "@/src/lib/slack";

export async function Header({ title }: { title: string }) {
  const session = await auth();
  const user = session?.user?.slack_user_id
    ? await getUserBySlackId(session.user.slack_user_id)
    : null;

  const uchannels = await getChannels();

  return (
    <div className="flex justify-between items-center gap-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      {session && session.user && user ? (
        <UserDropdown
          user={user}
          image={session.user.image || undefined}
          channels={uchannels}
        />
      ) : (
        <SigninWithSlackButton />
      )}
    </div>
  );
}
