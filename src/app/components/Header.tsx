import { User } from "@/app/actions";
import { SigninWithSlackButton } from "@/components/SigninWithSlackButton";
import { UserDropdown } from "@/components/UserDropdown";
import { Session } from "next-auth";

type Props = {
  title: string;
  session: Session | null;
  user: User | null;
};

export function Header({ title, session, user }: Props) {
  return (
    <div className="flex justify-between items-center gap-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      {session && session.user && user ? (
        <UserDropdown user={user} image={session.user.image || undefined} />
      ) : (
        <SigninWithSlackButton />
      )}
    </div>
  );
}
