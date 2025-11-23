import { notFound, redirect } from "next/navigation";
import { ShoppingListDetailClient } from "@/features/shopping-list/components/ShoppingListDetailClient";
import { requireUser } from "@/lib/auth";
import { getCouplePartnerByProfileId } from "@/server/services/coupleService";
import { getListDetailData } from "@/server/services/listService";

type ListDetailContentProps = {
  listId: string;
  variant?: "page" | "modal";
};

export async function ListDetailContent({ listId }: ListDetailContentProps) {
  const user = await requireUser();

  const couplePartner = await getCouplePartnerByProfileId(user.id);

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
        recentLabels={cached.recentLabels}
      />
    </div>
  );
}
