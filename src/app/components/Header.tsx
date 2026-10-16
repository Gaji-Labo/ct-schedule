import { User } from "@/app/actions";
import { PageHeader } from "@/components/PageLayout";
import { SigninWithSlackButton } from "@/components/SigninWithSlackButton";
import { UserDropdown } from "@/components/UserDropdown";
import { getChannels } from "@/src/lib/slack";
import { Session } from "next-auth";
import type { ReactNode } from "react";

type Props = {
  title: string;
  /** 2階層目以降のページで渡す Breadcrumb */
  breadcrumb?: ReactNode;
  session: Session | null;
  user: User | null;
};

/** PageHeader に、ログイン状態に応じた右端の操作（ユーザーメニュー / Slack ログイン）を付けたもの */
export async function Header({ title, breadcrumb, session, user }: Props) {
  const uchannels = session ? await getChannels() : [];

  return (
    <PageHeader
      title={title}
      breadcrumb={breadcrumb}
      actions={
        session && session.user && user ? (
          <UserDropdown
            user={user}
            image={session.user.image || undefined}
            channels={uchannels}
          />
        ) : (
          <SigninWithSlackButton />
        )
      }
    />
  );
}
