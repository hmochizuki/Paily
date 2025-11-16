"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addItemAction(formData: FormData) {
  const user = await requireUser();
  const listId = formData.get("listId");
  const coupleId = formData.get("coupleId");
  const name = formData.get("name");

  if (typeof listId !== "string" || typeof coupleId !== "string") {
    throw new Error("無効なパラメータです");
  }

  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("アイテム名を入力してください");
  }

  const couplePartner = await prisma.couplePartner.findFirst({
    where: {
      profileId: user.id,
      coupleId: coupleId,
    },
  });

  if (!couplePartner) {
    throw new Error("このリストにアクセスする権限がありません");
  }

  const itemId = crypto.randomUUID();

  await prisma.$transaction([
    prisma.shoppingListItem.create({
      data: {
        id: itemId,
        listId: listId,
        coupleId: coupleId,
        addedById: user.id,
        name: name.trim(),
      },
    }),
    prisma.shoppingListItemState.create({
      data: {
        itemId: itemId,
        coupleId: coupleId,
        isChecked: false,
      },
    }),
  ]);

  revalidatePath(`/lists/${listId}`);
}
