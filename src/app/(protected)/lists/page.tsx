import Link from "next/link";
import { CreateListButton } from "@/features/shopping-list/components/CreateListButton";
import { DeleteListButton } from "@/features/shopping-list/components/DeleteListButton";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "共有リスト",
};

export default async function ListsPage() {
  const user = await requireUser();

  const couplePartner = await prisma.couplePartner.findFirst({
    where: { profileId: user.id },
    select: { coupleId: true },
  });

  if (!couplePartner) {
    return (
      <div className="space-y-6 px-4 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
            共有リスト
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            共有リストの一覧を表示します。
          </p>
        </div>

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
      </div>
    );
  }

  const lists = await prisma.shoppingList.findMany({
    where: { coupleId: couplePartner.coupleId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          共有リスト
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          共有リストの一覧を表示します。
        </p>
      </div>

      {lists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-center text-sm text-[var(--color-text-muted)]">
          まだリストがありません。新しいリストを作成してください。
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="relative rounded-lg border border-[var(--color-border-default)] bg-white transition-colors hover:bg-[var(--color-bg-subtle)]"
            >
              <Link href={`/lists/${list.id}`} className="block p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium text-[var(--color-text-default)]">
                      {list.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {list._count.items} アイテム
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {list.updatedAt.toLocaleDateString("ja-JP")}
                    </p>
                    {!list.isActive && (
                      <span className="mt-1 inline-block rounded-full bg-[var(--color-bg-muted)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                        非アクティブ
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="absolute right-2 top-2">
                <DeleteListButton listId={list.id} listTitle={list.title} />
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateListButton coupleId={couplePartner.coupleId} />
    </div>
  );
}
