import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getClient(tx?: Prisma.TransactionClient) {
  return tx ?? prisma;
}

export function findShoppingListsByCoupleIds(coupleIds: string[]) {
  if (coupleIds.length === 0) {
    return Promise.resolve([]);
  }

  return prisma.shoppingList.findMany({
    where: { coupleId: { in: coupleIds } },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        select: {
          state: {
            select: { isChecked: true },
          },
        },
      },
    },
  });
}

export function findShoppingListDetail(listId: string, coupleId: string) {
  return prisma.shoppingList.findUnique({
    where: {
      id: listId,
      coupleId,
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          state: true,
          addedBy: {
            select: { displayName: true },
          },
        },
      },
    },
  });
}

export function findShoppingListTitle(listId: string) {
  return prisma.shoppingList.findUnique({
    where: { id: listId },
    select: { title: true },
  });
}

export function findShoppingListById(listId: string) {
  return prisma.shoppingList.findUnique({
    where: { id: listId },
  });
}

export function createShoppingList(
  data: Prisma.ShoppingListUncheckedCreateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).shoppingList.create({ data });
}

export function deleteShoppingList(
  listId: string,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).shoppingList.delete({
    where: { id: listId },
  });
}

export function createShoppingListItem(
  data: Prisma.ShoppingListItemUncheckedCreateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).shoppingListItem.create({ data });
}

export function createShoppingListItemState(
  data: Prisma.ShoppingListItemStateUncheckedCreateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).shoppingListItemState.create({ data });
}

export function findShoppingListItemById(itemId: string) {
  return prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    select: {
      listId: true,
      coupleId: true,
      state: true,
    },
  });
}

export function deleteShoppingListItem(
  itemId: string,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).shoppingListItem.delete({
    where: { id: itemId },
  });
}

export function upsertShoppingListItemState(
  itemId: string,
  data: Prisma.ShoppingListItemStateUpsertArgs["create"],
  update: Prisma.ShoppingListItemStateUpsertArgs["update"],
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).shoppingListItemState.upsert({
    where: { itemId },
    update,
    create: data,
  });
}

export async function findRecentLabelsByCoupleId(coupleId: string, limit = 30) {
  const grouped = await prisma.shoppingListItem.groupBy({
    by: ["label"],
    where: {
      coupleId,
      label: {
        not: null,
      },
    },
    orderBy: {
      _max: {
        updatedAt: "desc",
      },
    },
    _max: {
      updatedAt: true,
    },
    take: limit,
  });

  return grouped
    .map((item) => item.label)
    .filter((label): label is string => Boolean(label));
}
