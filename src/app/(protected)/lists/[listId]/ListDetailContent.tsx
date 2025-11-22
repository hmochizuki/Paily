import { notFound, redirect } from "next/navigation";
import { ShoppingListDetailClient } from "@/features/shopping-list/components/ShoppingListDetailClient";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getListDetailData } from "@/server/services/lists";

type ListDetailContentProps = {
  listId: string;
  variant?: "page" | "modal";
};

export async function ListDetailContent({ listId }: ListDetailContentProps) {
  const user = await requireUser();

  const couplePartner = await prisma.couplePartner.findFirst({
    where: { profileId: user.id },
    select: { coupleId: true },
  });

  if (!couplePartner) {
    redirect("/lists");
  }

  const cached = await getListDetailData(user.id, listId);

  if (!cached) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ShoppingListDetailClient
        listId={cached.listId}
        coupleId={cached.coupleId}
        initialItemsDto={cached.items}
        currentUserDisplayName={cached.currentUserDisplayName}
      />
    </div>
  );
}
