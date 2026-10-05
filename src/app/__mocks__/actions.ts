/**
 * Storybook 用の Server Actions モック（.storybook/preview.tsx の sb.mock で差し替える）
 *
 * 既定ではダミーデータを返す。Story ごとに変えたいときは beforeEach で上書きする:
 *   beforeEach: () => { mocked(getUsers).mockResolvedValue([]); }
 */
import type * as Actions from "../actions";
import { fn } from "storybook/test";
import { currentUser, users } from "@/src/stories/fixtures";

export type { User } from "../actions";

export const upsertUserFromSlack = fn<typeof Actions.upsertUserFromSlack>(
  async () => currentUser,
).mockName("upsertUserFromSlack");

export const getUserBySlackId = fn<typeof Actions.getUserBySlackId>(
  async (slackUserId) =>
    users.find((user) => user.slack_user_id === slackUserId) ?? null,
).mockName("getUserBySlackId");

export const setUser = fn<typeof Actions.setUser>(
  async () => currentUser,
).mockName("setUser");

export const getUsers = fn<typeof Actions.getUsers>(async () => users).mockName(
  "getUsers",
);

export const updateUser = fn<typeof Actions.updateUser>(
  async () => currentUser,
).mockName("updateUser");

export const deleteUser = fn<typeof Actions.deleteUser>(
  async (id) => users.find((user) => user.id === id)?.slack_display_name,
).mockName("deleteUser");

export const getHolidays = fn<typeof Actions.getHolidays>(
  async () => [],
).mockName("getHolidays");

export const saveHolidaysToDB = fn<typeof Actions.saveHolidaysToDB>(
  async () => {},
).mockName("saveHolidaysToDB");
