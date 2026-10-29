/**
 * Storybook から GitHub 上のファイルへのリンクを作る。
 *
 * リンク先は Storybook をビルドしたブランチ（.storybook/main.ts の STORYBOOK_GIT_BRANCH）。
 * main 固定だと、まだマージしていないブランチで足したファイル（docs/design/ など）が 404 になるため。
 */
const REPO = "https://github.com/Gaji-Labo/ct-schedule";
const branch = process.env.STORYBOOK_GIT_BRANCH || "main";

/** リポジトリ直下からのパス（例: "docs/design/rules.md#色"）を GitHub の URL にする */
export const repoUrl = (path: string) => `${REPO}/blob/${branch}/${path}`;
