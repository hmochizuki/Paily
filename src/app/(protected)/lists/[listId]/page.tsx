import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AddItemForm } from "@/features/shopping-list/components/AddItemForm";
import { CompletedItemsSection } from "@/features/shopping-list/components/CompletedItemsSection";
import { ShoppingListItemRow } from "@/features/shopping-list/components/ShoppingListItemRow";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ListDetailPageProps {
  params: Promise<{
    listId: string;
  }>;
}

export async function generateMetadata({ params }: ListDetailPageProps) {
  const { listId } = await params;
  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    select: { title: true },
  });

  return {
    title: list?.title ?? "リスト詳細",
  };
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { listId } = await params;
  const user = await requireUser();

  const couplePartner = await prisma.couplePartner.findFirst({
    where: { profileId: user.id },
    select: { coupleId: true },
  });

  if (!couplePartner) {
    redirect("/lists");
  }

  const list = await prisma.shoppingList.findUnique({
    where: {
      id: listId,
      coupleId: couplePartner.coupleId,
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          state: true,
          addedBy: {
            select: { displayName: true },
          },
        },
      },
    },
  });

  if (!list) {
    notFound();
  }

  const uncheckedItems = list.items.filter((item) => !item.state?.isChecked);
  const checkedItems = list.items.filter((item) => item.state?.isChecked);

  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <Link
          href="/lists"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          リスト一覧
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          {list.title}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {list.items.length} アイテム（{checkedItems.length} 完了）
        </p>
      </div>

      <AddItemForm listId={list.id} coupleId={list.coupleId} />

      {list.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-center text-sm text-[var(--color-text-muted)]">
          アイテムがありません。上のフォームから追加してください。
        </div>
      ) : (
        <div className="space-y-4">
          {uncheckedItems.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-[var(--color-text-muted)]">
                未完了 ({uncheckedItems.length})
              </h2>
              <div className="space-y-1">
                {uncheckedItems.map((item) => (
                  <ShoppingListItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {checkedItems.length > 0 && (
            <CompletedItemsSection items={checkedItems} />
          )}
        </div>
      )}
    </div>
  );
}
