import type { CT } from "@/src/utils/member";

function buildMessage(ct: CT): string {
  const lines = ["📅 本日のCTペア", ""];
  const pairLines = ct.round.map(([user1, user2]) => {
    const pair1 = user1.slack_display_name;
    const pair2 = user2 ? user2.slack_display_name : "お休み";
    return `- @${pair1} @${pair2}`;
  });
  return [...lines, ...pairLines].join("\n");
}
