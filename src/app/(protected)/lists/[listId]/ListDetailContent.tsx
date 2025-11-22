import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShoppingListDetailClient } from "@/features/shopping-list/components/ShoppingListDetailClient";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ListDetailContentProps = {
  listId: string;
  variant?: "page" | "modal";
};

export async function ListDetailContent({
  listId,
  variant = "page",
}: ListDetailContentProps) {
  const user = await requireUser();

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { displayName: true },
  });

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

  const checkedItems = list.items.filter((item) => item.state?.isChecked);
  const currentUserDisplayName = profile?.displayName ?? user.email ?? "あなた";

  const heading = (
    <div className="space-y-2">
      {variant === "page" ? (
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
      ) : (
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
          共有リスト
        </p>
      )}
      <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
        {list.title}
      </h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        {list.items.length} アイテム（{checkedItems.length} 完了）
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {heading}
      <ShoppingListDetailClient
        listId={list.id}
        coupleId={list.coupleId}
        initialItems={list.items}
        currentUserDisplayName={currentUserDisplayName}
      />
    </div>
  );
}
