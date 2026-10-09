---
name: implement-ui
description: 社内アプリ（CT スケジュール）の画面・コンポーネント・Story を実装・変更するときの手順と検証。新しい画面を作る、既存画面を作り直す、部品や Story を追加する、見た目を直すときに使う。「画面を作って」「ページを追加」「Story を書いて」「UI を直して」など。
---

# UI を実装する

画面・部品・Story を作るときの進め方。**何を守るか**（文脈・原則・色・余白・部品・禁止事項）は `DESIGN.md` にあり、このスキルは**どう進めて、どう確かめるか**だけを扱う。

依頼内容: $ARGUMENTS

## 0. 最初に読む

1. `DESIGN.md` を全部読む。特に「アプリごとの文脈」「デザイン原則」「制約」
2. 使えそうな部品の Story と docs（`parameters.docs.description`）、ガイドライン（`src/design-system/guidelines/*.mdx`）を読む
3. 似た画面がすでにあれば、その画面の Story（`src/design-system/pages/`）と実装を読み、組み立て方をそろえる

## 1. 文脈を決める

コードを書く前に、次の3つを短く言葉にしてから進める（最終報告にも書く）。

- この画面を**誰が・いつ・何のために**開くか
- **最初に目に入るべき情報**は何か
- **取り消せない操作**はあるか（あれば確認を挟む）

## 2. 部品を選ぶ

- DESIGN.md「コンポーネント」の表から選ぶ。表にない組み合わせをするときは、その部品のガイドラインの OK / NG に従う
- 足りない部品があれば、**画面より先に**部品と Story を作る（`src/app/components/`）。画面の中だけで使う独自カード・独自ラベルは作らない

## 3. 組み立てる

- 色・余白・角丸・文字は DESIGN.md「制約」の表から選ぶ。任意値・パレット色は使わない
- ページの骨組みは既存ページにそろえる（`SiteHeader` → `main` の中にパンくず・見出し・本文）

## 4. Story を書く

### 画面の Story

- 置き場所: `src/design-system/pages/<画面名>Page.stories.tsx`
- `title: "Pages/<画面名（日本語）>"`、`parameters.layout: "fullscreen"`
- `parameters.docs.description.component` に、何の画面か・本番のどのパスか・どこから来るかを書く
- モックデータは `src/design-system/mocks/ct.ts` を使う。足りなければそこに足す
- DB・Slack・サーバーアクションにつながる部品は Storybook で動かないので、**見た目が同じ代用品**を Story 内に置き、コメントで「本物は ○○」と書く
- 画面間のリンクは `href="/?path=/story/pages-<画面名>--default"` と `target="_top"` で Storybook 内を移動させる

### 用意する状態

「通常」だけで終わらせない。UI Stack（理想 / 空 / エラー / 部分的 / 読み込み中）に沿って、画面にありうる状態を Story にする。

- 通常 / データ0件 / 長い名前・多い件数 / 読み込み中・エラー（あれば）
- ログイン中 / 未ログイン で表示が変わるなら両方
- CT 固有: 祝日の週、参加人数が奇数（お休みあり）、今週のカード

各 Story には、どんな状態かを1行の JSDoc コメントで書く。

## 5. 検証する

```bash
bun run verify:ui   # lint（design-system/* ルール）→ test → Storybook ビルド
```

- 新規・変更したコードは **lint のエラー0件・警告0件**
- `eslint.config.mjs` の「既知の違反」リストに入っているファイルは警告扱いになっている。置き換えたらリストから外してエラー扱いに戻す

Storybook（`bun run storybook`、http://localhost:6006）で次を確かめる。ブラウザを操作できるなら自分で確かめ、できなければ確かめていない項目として報告する。

- [ ] ライト・ダーク両方で崩れない（ツールバーのテーマ切替）
- [ ] Accessibility パネルに違反がない
- [ ] 長いテキストであふれない・レイアウトが崩れない
- [ ] 必要な状態（0件・エラー・お休み・祝日など）が抜けていない

## 6. 報告する

### 推測したことを記録する

作業中、DESIGN.md・Story・ガイドラインに**書かれていなかったので推測で決めたこと**は、その場で控えておく。小さなことも含める（余白の値、部品の選択、文言、並び順、状態の切り分けなど）。

### report.json を書いて HTML にする

最後に `.implement-ui/report.json` を次の形で書き、`bun run report:ui` を実行する。`.implement-ui/report.html` ができる（推測リスト、セッション記録から作る行動ログ、触ったファイル、作業のまとめ）。

```json
{
  "request": "依頼内容の要約",
  "context": { "who": "誰が・いつ開くか", "purpose": "何のためか", "first_seen": "最初に目に入るべき情報", "irreversible": "取り消せない操作 (なければ「なし」)" },
  "components_used": ["SiteHeader", "Button"],
  "new_components": [{ "name": "新しく作った部品・トークン", "reason": "作った理由" }],
  "stories": [{ "file": "src/design-system/pages/XxxPage.stories.tsx", "name": "Default", "state": "どんな状態か" }],
  "verification": [{ "item": "bun run verify:ui", "result": "pass | fail | unchecked", "note": "" }],
  "guesses": [
    {
      "topic": "何について",
      "decision": "どう決めたか",
      "reason": "なぜそうしたか",
      "basis": "既存コードから類推 | 一般的な慣習 | 依頼文から解釈 | 根拠なし",
      "fix": {
        "where": "どこに書いてあれば迷わなかったか (例: DESIGN.md「余白・サイズ」、src/design-system/guidelines/Carousel.mdx、Skill implement-ui「画面の Story」)",
        "what": "何が書いてあれば迷わなかったか (足すルール・値・OK/NG 例をそのまま書ける形で)"
      }
    }
  ]
}
```

`fix` は DESIGN.md「フィードバックの戻し先」の表に沿って書く。`where` はファイル名と見出しまで具体的に、`what` はそのまま追記できる文にする。推測ではなく作業中につまずいたこと（エラー、やり直し）も、ルールを直せば防げたなら `guesses` に入れる。

`guesses` が空になることはほぼない。迷わなかったと思っても、書かれていないことを自分で決めた箇所がないか見直す。

### 最終報告

チャットには次を短く書き、詳細は HTML を見るよう案内する。

- 1 で決めた文脈
- 作った・変えたファイル
- 検証の結果（通ったもの・確かめられなかったもの）
- 推測したことの件数と、特に人に確かめてほしいもの
- `.implement-ui/report.html` の場所
