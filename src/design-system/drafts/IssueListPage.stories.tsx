import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleCheck, CircleDot, Plus, RotateCw, SearchX } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { IssueListItem, type Issue } from "@/components/IssueListItem";
import { PageHeader, PageLayout, PageSection } from "@/components/PageLayout";
import { Pagination } from "@/components/Pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  FILTER_OPTIONS,
  ISSUE_COUNTS,
  ISSUES_PER_PAGE,
  createIssues,
  createLongIssues,
} from "@/src/design-system/mocks/issue-tracker";

type ListState = "open" | "closed";

const FILTERS = [
  { key: "author", label: "作成者" },
  { key: "label", label: "ラベル" },
  { key: "project", label: "プロジェクト" },
  { key: "milestone", label: "マイルストーン" },
  { key: "assignee", label: "担当者" },
  { key: "type", label: "種類" },
] as const satisfies { key: keyof typeof FILTER_OPTIONS; label: string }[];

const SORTS = [
  { value: "created-desc", label: "新しい順" },
  { value: "created-asc", label: "古い順" },
  { value: "comments-desc", label: "コメントが多い順" },
  { value: "updated-desc", label: "更新が新しい順" },
];

const ALL = "all";
const formatCount = (n: number) => n.toLocaleString("ja-JP");

/** 値に空白を含むときは "" で囲む */
const quote = (value: string) => (/\s/.test(value) ? `"${value}"` : value);

/** 検索の条件の文字列から、key:value を1つ取り出す */
const getQualifier = (query: string, key: string) =>
  query.match(new RegExp(`(?:^|\\s)${key}:("[^"]*"|\\S+)`))?.[1]?.replace(/"/g, "");

/** 検索の条件の文字列の key:value を置き換える (value が null なら外す) */
const setQualifier = (query: string, key: string, value: string | null) => {
  const rest = query
    .replace(new RegExp(`(?:^|\\s)${key}:("[^"]*"|\\S+)`, "g"), "")
    .trim();
  return value === null ? rest : `${rest} ${key}:${quote(value)}`.trim();
};

/** 絞り込みの URL。本物は /issues?q=...。Storybook ではハッシュにして、このページの中で条件を書き換える */
const filterHref = (qualifier: string) => `#q=${encodeURIComponent(qualifier)}`;

type PageProps = {
  /** 最初に見せる状態 */
  initialState: ListState;
  /** 今の条件でのオープン・クローズの件数 */
  counts: { open: number; closed: number };
  /** 1ページ分の Issue (モックなので、条件を変えても中身は変わらない) */
  issues: { open: Issue[]; closed: Issue[] };
  /** is:issue state:… 以外の条件 (例: label:bug) */
  initialFilters?: string;
  /** 今のページ (1 始まり) */
  page?: number;
  /** 読み込み中・読み込みに失敗した */
  status?: "ready" | "loading" | "error";
};

/**
 * Issue 一覧 (/issues) の見た目を、モックデータで再現したもの。
 * 検索・絞り込み・並べ替え・オープン/クローズの切り替えは、検索の条件の文字列を書き換えるところまで動く。
 * 一覧の中身はモックなので、条件を変えても変わらない (本物はサーバーで検索し直す)。
 */
const IssueListPage = ({
  initialState,
  counts,
  issues,
  initialFilters = "",
  page = 1,
  status = "ready",
}: PageProps) => {
  const initialQuery = `is:issue state:${initialState} ${initialFilters}`.trim();
  const [query, setQuery] = useState(initialQuery);
  const [draft, setDraft] = useState(initialQuery);
  const [sort, setSort] = useState(SORTS[0].value);

  const listState: ListState = getQualifier(query, "state") === "closed" ? "closed" : "open";
  const list = issues[listState];
  const total = counts[listState];
  const otherState: ListState = listState === "open" ? "closed" : "open";
  const totalPages = Math.ceil(total / ISSUES_PER_PAGE);

  const applyQuery = (next: string) => {
    setQuery(next);
    setDraft(next);
  };

  // 作成者・ラベルのリンク (#q=label:bug) を押したら、その条件を足す
  useEffect(() => {
    const onHashChange = () => {
      const match = window.location.hash.match(/^#q=(.+)$/);
      if (!match) return;
      const [key, value] = decodeURIComponent(match[1]).split(/:(.+)/);
      setQuery((current) => {
        const next = setQualifier(current, key, value.replace(/"/g, ""));
        setDraft(next);
        return next;
      });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    applyQuery(draft.trim());
  };

  const clearFilters = () => applyQuery(`is:issue state:${listState}`);

  const stateLabel = { open: "オープン", closed: "クローズ" };
  const stateIcon = { open: CircleDot, closed: CircleCheck };

  return (
    <PageLayout>
      <PageHeader
        title="Issue"
        actions={
          // 本物は作成画面 (/issues/new) へのリンク。作成画面はまだ無い
          <Button asChild>
            <a href="#new">
              <Plus />
              新しい Issue
            </a>
          </Button>
        }
      />

      <PageSection>
        <form role="search" onSubmit={onSubmit} className="grid gap-2">
          <Label htmlFor="issue-query">検索の条件</Label>
          <div className="flex gap-2">
            <Input
              id="issue-query"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="font-mono"
            />
            <Button type="submit" variant="outline">
              検索
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            自由な語と条件を組み合わせて探せます（例: <code className="font-mono">label:bug author:yamada</code>）
          </p>
        </form>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {FILTERS.map(({ key, label }) => (
            <div key={key} className="grid gap-2">
              <Label htmlFor={`filter-${key}`}>{label}</Label>
              <Select
                value={getQualifier(query, key) ?? ALL}
                onValueChange={(value) => applyQuery(setQualifier(query, key, value === ALL ? null : value))}
              >
                <SelectTrigger id={`filter-${key}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>すべて</SelectItem>
                  {FILTER_OPTIONS[key].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="rounded-lg border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted px-4 py-2">
            <div className="flex gap-1" role="group" aria-label="Issue の状態">
              {(["open", "closed"] as const).map((state) => {
                const Icon = stateIcon[state];
                const active = state === listState;
                return (
                  <Button
                    key={state}
                    variant={active ? "outline" : "ghost"}
                    size="sm"
                    aria-pressed={active}
                    onClick={() => applyQuery(setQualifier(query, "state", state))}
                  >
                    <Icon aria-hidden />
                    {stateLabel[state]}
                    {status === "ready" && <span>{formatCount(counts[state])}</span>}
                  </Button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="issue-sort">並び順</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger id="issue-sort" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {SORTS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === "loading" ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
              <Spinner aria-label="読み込み中" />
              Issue を読み込んでいます
            </div>
          ) : status === "error" ? (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertTitle>Issue を読み込めませんでした</AlertTitle>
                <AlertDescription className="grid justify-items-start gap-3">
                  <p>通信が切れたか、サーバーで問題が起きています。しばらくしてから読み込み直してください。</p>
                  <Button variant="outline" size="sm">
                    <RotateCw />
                    読み込み直す
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : list.length === 0 ? (
            <div className="grid justify-items-center gap-3 px-4 py-12 text-center">
              <SearchX aria-hidden className="size-6 text-muted-foreground" />
              <div className="grid gap-1">
                <p className="text-sm font-medium">
                  条件に合う{stateLabel[listState]}の Issue はありません
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  検索の条件を変えるか、絞り込みを解除してください。
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {counts[otherState] > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuery(setQualifier(query, "state", otherState))}
                  >
                    {stateLabel[otherState]}の Issue（{formatCount(counts[otherState])}件）を見る
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  条件をクリア
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y">
              {list.map((issue) => (
                <li key={issue.number}>
                  <IssueListItem
                    issue={issue}
                    // 本物は詳細 (/issues/14931)。詳細の画面はまだ無い
                    href={`#issue-${issue.number}`}
                    filterHref={filterHref}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {status === "ready" && total > 0 && (
          <div className="grid gap-2">
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefFor={(p) => `#page=${p}`}
              label="Issue 一覧のページ"
            />
            <p className="text-center text-xs text-muted-foreground">
              {formatCount(total)}件中 {formatCount((page - 1) * ISSUES_PER_PAGE + 1)}〜
              {formatCount(Math.min(page * ISSUES_PER_PAGE, total))}件
            </p>
          </div>
        )}
      </PageSection>
    </PageLayout>
  );
};

const defaultIssues = {
  open: createIssues({ state: "open" }),
  closed: createIssues({ state: "closed", startNumber: 14930 }),
};

const meta = {
  title: "Drafts/Issueトラッカー/Issue一覧",
  component: IssueListPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Issue一覧（本番のパスは /issues）をモックデータで再現した画面。リポジトリの Issue を探し、状態を確かめて開く。新しい Issue を書く入口でもある。上から「新しい Issue」→ 検索の条件と絞り込み → オープン/クローズの切り替えと並び順 → 一覧 → ページ送り。検索・絞り込み・切り替えは検索の条件の文字列（is:issue state:open …）を書き換えるところまで動く。一覧の中身はモックなので条件を変えても変わらない。",
      },
    },
  },
  args: {
    initialState: "open",
    counts: ISSUE_COUNTS,
    issues: defaultIssues,
    page: 1,
    status: "ready",
  },
} satisfies Meta<typeof IssueListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** オープンの Issue（1,048件）の1ページ目。条件は is:issue state:open、新しい順 */
export const Default: Story = {};

/** クローズの Issue（5,614件）。完了と対応しないが混ざり、閉じた人と日時が出る */
export const Closed: Story = {
  args: { initialState: "closed" },
};

/** ラベル bug で絞り込んだ（オープン 12件・クローズ 40件、ページ送りは出ない） */
export const FilteredByLabel: Story = {
  args: {
    initialFilters: "label:bug",
    counts: { open: 12, closed: 40 },
    issues: {
      open: createIssues({ state: "open", count: 12 }).map((issue) => ({ ...issue, labels: [issue.labels[0] ?? { name: "bug", color: "destructive" }] })),
      closed: createIssues({ state: "closed", count: 25 }),
    },
  },
};

/** 途中のページ（20ページ目） */
export const MiddlePage: Story = {
  args: { page: 20 },
};

/** 検索の結果が0件（オープンもクローズも0件） */
export const Empty: Story = {
  args: {
    initialFilters: "label:bug 存在しない語",
    counts: { open: 0, closed: 0 },
    issues: { open: [], closed: [] },
  },
};

/** オープンは0件だがクローズにはある（クローズを見るボタンが出る） */
export const EmptyOpenOnly: Story = {
  args: {
    initialFilters: "author:yamada",
    counts: { open: 0, closed: 3 },
    issues: { open: [], closed: createIssues({ state: "closed", count: 3 }) },
  },
};

/** 長い題名（コードを含む）・ラベルが多い・担当者が多い・空白のない長い英字 */
export const LongContent: Story = {
  args: {
    counts: { open: 10, closed: 0 },
    issues: { open: createLongIssues(), closed: [] },
  },
};

/** 読み込み中（件数と一覧の代わりにスピナー） */
export const Loading: Story = {
  args: { status: "loading" },
};

/** 読み込みに失敗した */
export const LoadError: Story = {
  args: { status: "error" },
};
