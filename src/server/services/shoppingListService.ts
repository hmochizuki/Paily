import {
  createShoppingList,
  createShoppingListItem,
  createShoppingListItemState,
  deleteShoppingList,
  deleteShoppingListItem,
  findShoppingListById,
  findShoppingListItemById,
  upsertShoppingListItemState,
} from "@/server/repositories/shoppingListRepository";
import { runTransaction } from "@/server/repositories/transaction";
import { getCouplePartnerByProfileAndCouple } from "@/server/services/coupleService";

async function assertMembership(userId: string, coupleId: string) {
  const membership = await getCouplePartnerByProfileAndCouple(userId, coupleId);

  if (!membership) {
    throw new Error("このカップルに所属していません");
  }
}

export async function createShoppingListForCouple(params: {
  userId: string;
  coupleId: string;
  title: string;
}) {
  await assertMembership(params.userId, params.coupleId);

  return createShoppingList({
    id: crypto.randomUUID(),
    coupleId: params.coupleId,
    title: params.title,
  });
}

export async function deleteShoppingListForCouple(params: {
  userId: string;
  listId: string;
}) {
  const list = await findShoppingListById(params.listId);

  if (!list) {
    throw new Error("リストが見つかりません");
  }

  await assertMembership(params.userId, list.coupleId);
  await deleteShoppingList(params.listId);
}

export async function addShoppingListItem(params: {
  userId: string;
  listId: string;
  coupleId: string;
  name: string;
  label: string | null;
  category: string | null;
}) {
  await assertMembership(params.userId, params.coupleId);
  const itemId = crypto.randomUUID();

  await runTransaction(async (tx) => {
    await createShoppingListItem(
      {
        id: itemId,
        listId: params.listId,
        coupleId: params.coupleId,
        addedById: params.userId,
        name: params.name,
        label: params.label ?? undefined,
        category: params.category ?? undefined,
      },
      tx,
    );

    await createShoppingListItemState(
      {
        itemId,
        coupleId: params.coupleId,
        isChecked: false,
      },
      tx,
    );
  });
}

export async function deleteShoppingListItemForCouple(params: {
  userId: string;
  itemId: string;
}) {
  const item = await findShoppingListItemById(params.itemId);

  if (!item) {
    throw new Error("アイテムが見つかりません");
  }

  await assertMembership(params.userId, item.coupleId);
  await deleteShoppingListItem(params.itemId);
  return item;
}

export async function toggleShoppingListItemState(params: {
  userId: string;
  itemId: string;
}) {
  const item = await findShoppingListItemById(params.itemId);

  if (!item) {
    throw new Error("アイテムが見つかりません");
  }

  await assertMembership(params.userId, item.coupleId);
  const newIsChecked = !item.state?.isChecked;

  await upsertShoppingListItemState(
    params.itemId,
    {
      itemId: params.itemId,
      coupleId: item.coupleId,
      isChecked: newIsChecked,
      checkedById: newIsChecked ? params.userId : null,
      checkedAt: newIsChecked ? new Date() : null,
    },
    {
      isChecked: newIsChecked,
      checkedById: newIsChecked ? params.userId : null,
      checkedAt: newIsChecked ? new Date() : null,
    },
  );

  return item;
}
