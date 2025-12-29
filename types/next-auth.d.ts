import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { slack_user_id: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    slack_user_id?: string;
  }
}
