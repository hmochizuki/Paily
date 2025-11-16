"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteItemAction(itemId: string) {
  const user = await requireUser();

  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    select: {
      listId: true,
      coupleId: true,
    },
  });

  if (!item) {
    throw new Error("アイテムが見つかりません");
  }

  const couplePartner = await prisma.couplePartner.findFirst({
    where: {
      profileId: user.id,
      coupleId: item.coupleId,
    },
  });

  if (!couplePartner) {
    throw new Error("このアイテムを削除する権限がありません");
  }

  await prisma.shoppingListItem.delete({
    where: { id: itemId },
  });

  revalidatePath(`/lists/${item.listId}`);
}
