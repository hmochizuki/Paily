import Link from "next/link";
import { Suspense } from "react";
import { ListsPageContent } from "@/features/shopping-list/components/ListsPageContent";
import { requireUser } from "@/lib/auth";
import { getListsData } from "@/server/services/lists";
import { ListsPageSkeleton } from "./_components/ListsPageSkeleton";

export const metadata = {
  title: "共有リスト",
};

export default function ListsPage() {
  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          共有リスト
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          共有リストの一覧を表示します。
        </p>
      </div>

      <Suspense fallback={<ListsPageSkeleton />}>
        <ListsDataSection />
      </Suspense>
    </div>
  );
}

async function ListsDataSection() {
  const user = await requireUser();
  const cached = await getListsData(user.id);

  if (cached.userSpaceIds.length === 0) {
    return <NoSpaceMessage />;
  }

  return (
    <ListsPageContent
      allLists={cached.lists}
      userSpaceIds={cached.userSpaceIds}
    />
  );
}

function NoSpaceMessage() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-8 text-center">
      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        共有スペースがまだ作成されていません。
        <br />
        プロフィール画面からスペースを作成してください。
      </p>
      <Link
        href="/settings/profile"
        className="inline-block rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)]"
      >
        プロフィール画面へ
      </Link>
    </div>
  );
}
