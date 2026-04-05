"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  addShoppingListItem,
  createShoppingListForCouple,
  deleteShoppingListForCouple,
  deleteShoppingListItemForCouple,
  toggleShoppingListItemState,
} from "@/server/services/shoppingListService";

export async function createListAction(formData: FormData) {
  const user = await requireUser();
  const title = formData.get("title");
  const coupleId = formData.get("coupleId");

  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("タイトルを入力してください");
  }

  if (typeof coupleId !== "string") {
    throw new Error("カップルIDが無効です");
  }

  const list = await createShoppingListForCouple({
    userId: user.id,
    coupleId,
    title: title.trim(),
  });

  revalidatePath("/lists");
  redirect(`/lists/${list.id}`);
}

export async function deleteListAction(listId: string) {
  const user = await requireUser();

  await deleteShoppingListForCouple({ userId: user.id, listId });

  revalidatePath("/lists");
}

export async function addItemAction(formData: FormData) {
  const user = await requireUser();
  const listId = formData.get("listId");
  const coupleId = formData.get("coupleId");
  const name = formData.get("name");
  const rawLabel = formData.get("label");
  const rawCategory = formData.get("category");

  if (typeof listId !== "string" || typeof coupleId !== "string") {
    throw new Error("無効なパラメータです");
  }

  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("アイテム名を入力してください");
  }

  const label =
    typeof rawLabel === "string" && rawLabel.trim() !== ""
      ? rawLabel.trim()
      : null;

  if (label && label.length > 10) {
    throw new Error("ラベルは10文字以内で入力してください");
  }

  const category =
    typeof rawCategory === "string" && rawCategory.trim() !== ""
      ? rawCategory.trim()
      : null;

  await addShoppingListItem({
    userId: user.id,
    coupleId,
    listId,
    name: name.trim(),
    label,
    category,
  });

  revalidatePath(`/lists/${listId}`);
}

export async function deleteItemAction(itemId: string) {
  const user = await requireUser();

  const item = await deleteShoppingListItemForCouple({
    userId: user.id,
    itemId,
  });

  revalidatePath(`/lists/${item.listId}`);
}

export async function toggleItemCheckAction(itemId: string) {
  const user = await requireUser();

  const item = await toggleShoppingListItemState({
    userId: user.id,
    itemId,
  });

  revalidatePath(`/lists/${item.listId}`);
}
