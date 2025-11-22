import { notFound, redirect } from "next/navigation";
import { ShoppingListDetailClient } from "@/features/shopping-list/components/ShoppingListDetailClient";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ListDetailContentProps = {
  listId: string;
  variant?: "page" | "modal";
};

export async function ListDetailContent({ listId }: ListDetailContentProps) {
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

  const currentUserDisplayName = profile?.displayName ?? user.email ?? "あなた";
  return (
    <div className="space-y-6">
      <ShoppingListDetailClient
        listId={list.id}
        coupleId={list.coupleId}
        initialItems={list.items}
        currentUserDisplayName={currentUserDisplayName}
      />
    </div>
  );
}
