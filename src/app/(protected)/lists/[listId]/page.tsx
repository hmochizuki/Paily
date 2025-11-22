import { prisma } from "@/lib/prisma";
import { ListDetailContent } from "./ListDetailContent";
import { ListDetailModalShell } from "./ListDetailModalShell";

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

  return (
    <ListDetailModalShell>
      <ListDetailContent listId={listId} variant="modal" />
    </ListDetailModalShell>
  );
}
