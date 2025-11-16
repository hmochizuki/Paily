"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleItemCheckAction(itemId: string) {
  const user = await requireUser();

  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    select: {
      listId: true,
      coupleId: true,
      state: true,
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
    throw new Error("このアイテムにアクセスする権限がありません");
  }

  const newIsChecked = !item.state?.isChecked;

  await prisma.shoppingListItemState.upsert({
    where: { itemId: itemId },
    update: {
      isChecked: newIsChecked,
      checkedById: newIsChecked ? user.id : null,
      checkedAt: newIsChecked ? new Date() : null,
    },
    create: {
      itemId: itemId,
      coupleId: item.coupleId,
      isChecked: newIsChecked,
      checkedById: newIsChecked ? user.id : null,
      checkedAt: newIsChecked ? new Date() : null,
    },
  });

  revalidatePath(`/lists/${item.listId}`);
}
