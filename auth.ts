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
      await upsertUserFromSlack({
        slack_user_id: profile?.sub as string,
        slack_email: profile?.email as string,
        slack_display_name: profile?.name as string,
        slack_image: profile?.picture,
      });
      return true;
    },
  },
});
