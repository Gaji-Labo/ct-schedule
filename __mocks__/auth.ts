/**
 * Storybook 用の Auth.js モック（.storybook/preview.tsx の sb.mock で差し替える）
 *
 * 既定は未ログイン。ログイン状態の Story では beforeEach で上書きする:
 *   beforeEach: () => { mocked(auth).mockResolvedValue(createSession()); }
 */
import type { Session } from "next-auth";
import { fn } from "storybook/test";

// 実体の auth() はオーバーロードが多く型を合わせづらいため、ページから呼ばれる形だけを定義する
export const auth = fn(async (): Promise<Session | null> => null).mockName(
  "auth",
);

export const signIn = fn(async () => {}).mockName("signIn");

export const signOut = fn(async () => {}).mockName("signOut");

export const handlers = {
  GET: fn().mockName("handlers.GET"),
  POST: fn().mockName("handlers.POST"),
};
