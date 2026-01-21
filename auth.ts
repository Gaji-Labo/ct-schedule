import { upsertUserFromSlack } from "@/app/actions";
import NextAuth from "next-auth";
import Slack from "next-auth/providers/slack";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Slack({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ profile }) {
      try {
        const res = await fetch(
          // ログインしたユーザーのプロフィール情報を取得
          `https://slack.com/api/users.profile.get?user=${profile?.sub}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            },
          }
        );
        const data = await res.json();

        await upsertUserFromSlack({
          slack_user_id: profile?.sub as string,
          slack_email: profile?.email as string,
          slack_display_name:
            data.profile.display_name || (profile?.name as string),
          slack_image:
            data.profile?.image_192 ||
            data.profile?.image_72 ||
            data.profile?.image_48 ||
            profile?.picture,
        });
        return true;
      } catch (error) {
        console.error("signIn callback error:", error);
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.slack_user_id = profile.sub;
      }
      return token;
    },
    async session({ token, session }) {
      session.user.slack_user_id = token.slack_user_id as string;
      return session;
    },
  },
});
