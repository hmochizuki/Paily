"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteListAction(listId: string) {
  const user = await requireUser();

  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    select: { coupleId: true },
  });

  if (!list) {
    throw new Error("リストが見つかりません");
  }

  const couplePartner = await prisma.couplePartner.findFirst({
    where: {
      profileId: user.id,
      coupleId: list.coupleId,
    },
  });

  if (!couplePartner) {
    throw new Error("このリストを削除する権限がありません");
  }

  await prisma.shoppingList.delete({
    where: { id: listId },
  });

  revalidatePath("/lists");
}
