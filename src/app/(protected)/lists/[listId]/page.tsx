import { Suspense } from "react";

import { getShoppingListTitle } from "@/server/services/listService";

import { ListDetailSkeleton } from "./_components/ListDetailSkeleton";
import { ListDetailContent } from "./ListDetailContent";
import { ListDetailModalShell } from "./ListDetailModalShell";

interface ListDetailPageProps {
  params: Promise<{
    listId: string;
  }>;
}

export async function generateMetadata({ params }: ListDetailPageProps) {
  const { listId } = await params;
  const listTitle = await getShoppingListTitle(listId);

  return {
    title: `リスト詳細 ${listTitle && `| ${listTitle}`}`,
  };
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { listId } = await params;
  const listTitle = await getShoppingListTitle(listId);

  return (
    <ListDetailModalShell listTitle={listTitle ?? "リスト詳細"}>
      <Suspense fallback={<ListDetailSkeleton />}>
        <ListDetailContent listId={listId} variant="modal" />
      </Suspense>
    </ListDetailModalShell>
  );
}
