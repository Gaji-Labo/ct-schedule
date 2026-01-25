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
