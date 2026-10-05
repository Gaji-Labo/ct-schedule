import type { Session } from "next-auth";
import type { Mock } from "storybook/test";
import { auth } from "@/auth";

/**
 * Storybook では auth は __mocks__/auth.ts のモックに差し替わっている。
 * 実体の auth() はミドルウェア用などのオーバーロードを持ち mocked(auth) の型が合わないため、
 * ページから呼ばれる形（Session を返す）にそろえて扱う
 *
 * @example
 *   beforeEach: () => { mockedAuth.mockResolvedValue(createSession()); }
 */
export const mockedAuth = auth as unknown as Mock<
  () => Promise<Session | null>
>;
