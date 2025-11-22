import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShoppingListDetailClient } from "@/features/shopping-list/components/ShoppingListDetailClient";
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

  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
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

      <ShoppingListDetailClient
        listId={list.id}
        coupleId={list.coupleId}
        initialItems={list.items}
        currentUserDisplayName={currentUserDisplayName}
      />
    </div>
  );
}
