/**
 * share.ts の中で、git や fs に触れない部分。テストは share-lib.test.ts。
 */

export type Scope = "app" | "system";

/** 推測ごとの人の判定。accepted: そのまま採る / corrected: 直して採る / held: 保留 */
export type Verdict = "accepted" | "corrected" | "held";
export const VERDICTS: Verdict[] = ["accepted", "corrected", "held"];

/**
 * 人が確認したあとに書く review.json。report.json からも git の履歴からも復元できないものだけを持つ。
 * - guesses: report.json の guesses の各項目への判定 (index は report.json の guesses の配列の位置)
 * - missed: AI が推測として挙げず、人が確認で指摘したこと
 */
export type Review = {
  guesses: { index: number; verdict: Verdict; answer?: string }[];
  missed: { topic: string; feedback: string; scope?: Scope; fix?: { where: string; what: string } }[];
};

/**
 * git の remote の URL から owner/repo だけを取り出す。GitHub 以外や形が読めないときは null。
 * remote に https://user:token@github.com/... のようにトークンが入っていても、共有リポジトリに載せないため
 */
export function repoName(remote: string): string | null {
  const m = remote.trim().match(/github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/);
  return m ? m[1] : null;
}

export function countGuesses(guesses: { scope?: string }[]) {
  return {
    total: guesses.length,
    app: guesses.filter((g) => g.scope === "app").length,
    system: guesses.filter((g) => g.scope === "system").length,
  };
}

const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/** review.json の形を確かめる。問題があればその説明を返す (空なら問題なし)。 */
export function validateReview(review: unknown, guessCount: number): string[] {
  const errors: string[] = [];
  if (typeof review !== "object" || review === null) return ["review.json がオブジェクトではありません"];
  const { guesses, missed } = review as Record<string, unknown>;

  if (!Array.isArray(guesses)) {
    errors.push("guesses が配列ではありません");
  } else {
    const seen = new Set<number>();
    guesses.forEach((g, i) => {
      const at = `guesses[${i}]`;
      if (typeof g !== "object" || g === null) return errors.push(`${at} がオブジェクトではありません`);
      const { index, verdict, answer } = g as Record<string, unknown>;
      if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index >= guessCount) {
        errors.push(`${at}.index は report.json の guesses の位置 (0〜${guessCount - 1}) にしてください`);
      } else if (seen.has(index)) {
        errors.push(`${at}.index ${index} が重複しています`);
      } else {
        seen.add(index);
      }
      if (!VERDICTS.includes(verdict as Verdict)) errors.push(`${at}.verdict は ${VERDICTS.join(" | ")} のどれかにしてください`);
      if (verdict === "corrected" && !isText(answer)) errors.push(`${at} は corrected なので answer (直した答え) が要ります`);
    });
    const missing = Array.from({ length: guessCount }, (_, i) => i).filter((i) => !seen.has(i));
    if (missing.length) errors.push(`判定のない推測があります (index: ${missing.join(", ")})。決めていないものは held にしてください`);
  }

  if (!Array.isArray(missed)) {
    errors.push("missed が配列ではありません (なければ [])");
  } else {
    missed.forEach((m, i) => {
      const at = `missed[${i}]`;
      if (typeof m !== "object" || m === null) return errors.push(`${at} がオブジェクトではありません`);
      const { topic, feedback, scope, fix } = m as Record<string, unknown>;
      if (!isText(topic)) errors.push(`${at}.topic が空です`);
      if (!isText(feedback)) errors.push(`${at}.feedback (人の指摘) が空です`);
      if (scope !== undefined && scope !== "app" && scope !== "system") errors.push(`${at}.scope は app | system にしてください`);
      if (fix !== undefined) {
        const f = fix as Record<string, unknown> | null;
        if (typeof f !== "object" || f === null || !isText(f.where) || !isText(f.what)) errors.push(`${at}.fix には where と what が要ります`);
      }
    });
  }
  return errors;
}

export function countVerdicts(review: Review) {
  return {
    accepted: review.guesses.filter((g) => g.verdict === "accepted").length,
    corrected: review.guesses.filter((g) => g.verdict === "corrected").length,
    held: review.guesses.filter((g) => g.verdict === "held").length,
    missed: review.missed.length,
  };
}
