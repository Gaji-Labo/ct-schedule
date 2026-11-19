import { describe, expect, test } from "bun:test";
import { countGuesses, countVerdicts, repoName, validateReview, type Review } from "./share-lib";

describe("repoName", () => {
  test.each([
    "https://github.com/Gaji-Labo/ct-schedule.git",
    "https://github.com/Gaji-Labo/ct-schedule",
    "git@github.com:Gaji-Labo/ct-schedule.git",
    "ssh://git@github.com/Gaji-Labo/ct-schedule.git",
    "https://github.com/Gaji-Labo/ct-schedule/\n",
  ])("%p から owner/repo を取る", (remote) => {
    expect(repoName(remote)).toBe("Gaji-Labo/ct-schedule");
  });

  test("URL にトークンが入っていても owner/repo だけを返す", () => {
    const name = repoName("https://mk-0A0:ghp_EXAMPLE0000000000000000000000000000@github.com/Gaji-Labo/ct-schedule.git");
    expect(name).toBe("Gaji-Labo/ct-schedule");
  });

  test.each(["", "https://gitlab.com/Gaji-Labo/ct-schedule.git", "/Users/someone/ct-schedule"])("%p は null", (remote) => {
    expect(repoName(remote)).toBeNull();
  });
});

describe("countGuesses", () => {
  test("scope ごとに数え、scope のないものは total にだけ入る", () => {
    expect(countGuesses([{ scope: "app" }, { scope: "system" }, { scope: "app" }, {}])).toEqual({ total: 4, app: 2, system: 1 });
  });
});

describe("validateReview", () => {
  const ok: Review = {
    guesses: [
      { index: 0, verdict: "accepted" },
      { index: 1, verdict: "corrected", answer: "空状態の文言は「まだ参加者がいません」" },
      { index: 2, verdict: "held" },
    ],
    missed: [
      {
        topic: "ダークモードの名前の色",
        feedback: "ダークで名前が読めない",
        scope: "system",
        fix: { where: "docs/design/rules.md「色」", what: "カードの地は bg-muted を使う" },
      },
    ],
  };

  test("正しい形なら問題なし", () => {
    expect(validateReview(ok, 3)).toEqual([]);
  });

  test("missed は空配列でよく、scope と fix は省ける", () => {
    expect(validateReview({ guesses: ok.guesses, missed: [{ topic: "a", feedback: "b" }] }, 3)).toEqual([]);
    expect(validateReview({ guesses: ok.guesses, missed: [] }, 3)).toEqual([]);
  });

  test("推測がないレポートは guesses も空でよい", () => {
    expect(validateReview({ guesses: [], missed: [] }, 0)).toEqual([]);
  });

  test("判定のない推測があれば、その index を挙げる", () => {
    const errors = validateReview({ guesses: [{ index: 1, verdict: "held" }], missed: [] }, 3);
    expect(errors).toEqual(["判定のない推測があります (index: 0, 2)。決めていないものは held にしてください"]);
  });

  test("index の範囲外・重複・整数でないものを弾く", () => {
    const errors = validateReview(
      {
        guesses: [
          { index: 0, verdict: "held" },
          { index: 0, verdict: "held" },
          { index: 1.5, verdict: "held" },
          { index: 5, verdict: "held" },
        ],
        missed: [],
      },
      2,
    );
    expect(errors).toContain("guesses[1].index 0 が重複しています");
    expect(errors).toContain("guesses[2].index は report.json の guesses の位置 (0〜1) にしてください");
    expect(errors).toContain("guesses[3].index は report.json の guesses の位置 (0〜1) にしてください");
  });

  test("verdict の値と、corrected の answer を確かめる", () => {
    const errors = validateReview(
      {
        guesses: [
          { index: 0, verdict: "ok" },
          { index: 1, verdict: "corrected", answer: " " },
        ],
        missed: [],
      },
      2,
    );
    expect(errors).toEqual([
      "guesses[0].verdict は accepted | corrected | held のどれかにしてください",
      "guesses[1] は corrected なので answer (直した答え) が要ります",
    ]);
  });

  test("missed の必須項目・scope・fix を確かめる", () => {
    const errors = validateReview(
      { guesses: [], missed: [{ topic: "", feedback: "x", scope: "global", fix: { where: "rules.md" } }] },
      0,
    );
    expect(errors).toEqual([
      "missed[0].topic が空です",
      "missed[0].scope は app | system にしてください",
      "missed[0].fix には where と what が要ります",
    ]);
  });

  test("配列でない・オブジェクトでないものを弾く", () => {
    expect(validateReview(null, 0)).toEqual(["review.json がオブジェクトではありません"]);
    expect(validateReview({ guesses: {}, missed: "none" }, 0)).toEqual([
      "guesses が配列ではありません",
      "missed が配列ではありません (なければ [])",
    ]);
  });
});

describe("countVerdicts", () => {
  test("判定ごとと missed の件数を数える", () => {
    expect(
      countVerdicts({
        guesses: [
          { index: 0, verdict: "accepted" },
          { index: 1, verdict: "accepted" },
          { index: 2, verdict: "corrected", answer: "x" },
        ],
        missed: [{ topic: "a", feedback: "b" }],
      }),
    ).toEqual({ accepted: 2, corrected: 1, held: 0, missed: 1 });
  });
});
