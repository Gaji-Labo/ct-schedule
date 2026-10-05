/**
 * Storybook 用の Slack API モック（.storybook/preview.tsx の sb.mock で差し替える）
 */
import type * as Slack from "../slack";
import { fn } from "storybook/test";
import { channels } from "@/src/stories/fixtures";

export type { SlackChannelResponse } from "../slack";

export const postMessage = fn<typeof Slack.postMessage>(
  async () => {},
).mockName("postMessage");

export const getChannels = fn<typeof Slack.getChannels>(
  async () => channels,
).mockName("getChannels");
