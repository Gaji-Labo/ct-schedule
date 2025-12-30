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
    async signIn() {
      // const res = await fetch(
      //   // ログインしたユーザーのプロフィール情報を取得
      //   `https://slack.com/api/users.profile.get?user=${profile?.sub}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      //     },
      //   }
      // );
      // const data = await res.json();

      // await upsertUserFromSlack({
      //   slack_user_id: profile?.sub as string,
      //   slack_email: profile?.email as string,
      //   slack_display_name: data.profile.display_name,
      //   slack_image: profile?.picture,
      // });

      console.log("signIn callback executed");
      return true;
    },
    async jwt({ token, account, profile }) {
      if (token && account) {
        token.slack_user_id = profile?.sub;
      }
      return token;
    },
    async session({ token, session }) {
      session.user.slack_user_id = token.slack_user_id as string;
      return session;
    },
  },
});
