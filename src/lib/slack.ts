/**
 * Slack API Wrapper
 * Slack APIを呼び出すための関数群
 */

export async function postMessage(
  channel: string,
  text: string,
): Promise<void> {
  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel, text }),
    });
    const data = await res.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }
  } catch (error) {
    console.error("Slack API error:", error);
    throw error;
  }
}

export type SlackChannelResponse = {
  id: string;
  name_normalized: string;
  is_archived: boolean;
};

export async function getChannels(): Promise<
  Pick<SlackChannelResponse, "id" | "name_normalized">[]
> {
  try {
    const res = await fetch(
      "https://slack.com/api/conversations.list?limit=1000",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();

    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    const channels = data.channels.filter((channel: SlackChannelResponse) => {
      return channel.name_normalized.startsWith("u-") && !channel.is_archived;
    });
    return channels;
  } catch (error) {
    console.error("Slack API error:", error);
    throw error;
  }
}
