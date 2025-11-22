import { unstable_cache } from "next/cache";
import type { ShoppingListItemDto } from "@/features/shopping-list/types";
import { prisma } from "@/lib/prisma";
import { CACHE_TTL_SECONDS } from "@/server/cache/policy";

export type ListOverviewDto = {
  id: string;
  title: string;
  coupleId: string;
  isActive: boolean;
  updatedAt: string;
  uncheckedItemCount: number;
};

export type ListsData = {
  userSpaceIds: string[];
  lists: ListOverviewDto[];
};

async function fetchListsData(userId: string): Promise<ListsData> {
  const couplePartners = await prisma.couplePartner.findMany({
    where: { profileId: userId },
    select: { coupleId: true },
  });

  if (couplePartners.length === 0) {
    return { userSpaceIds: [], lists: [] };
  }

  const userSpaceIds = couplePartners.map((cp) => cp.coupleId);

  const lists = await prisma.shoppingList.findMany({
    where: { coupleId: { in: userSpaceIds } },
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

  const serialized: ListOverviewDto[] = lists.map((list) => ({
    id: list.id,
    title: list.title,
    coupleId: list.coupleId,
    isActive: list.isActive,
    updatedAt: list.updatedAt.toISOString(),
    uncheckedItemCount: list.items.reduce((count, item) => {
      return count + (item.state?.isChecked ? 0 : 1);
    }, 0),
  }));

  return { userSpaceIds, lists: serialized };
}

const listsDataCache = unstable_cache(fetchListsData, ["lists-data"], {
  revalidate: CACHE_TTL_SECONDS,
});

export async function getListsData(userId: string) {
  return listsDataCache(userId);
}

export async function getListsDataFresh(userId: string) {
  return fetchListsData(userId);
}

export type ListDetailData = {
  listId: string;
  coupleId: string;
  items: ShoppingListItemDto[];
  currentUserDisplayName: string;
};

async function fetchListDetailData(
  userId: string,
  listId: string,
): Promise<ListDetailData | null> {
  const profilePromise = prisma.profile.findUnique({
    where: { id: userId },
    select: { displayName: true },
  });

  const couplePartnerPromise = prisma.couplePartner.findFirst({
    where: { profileId: userId },
    select: { coupleId: true },
  });

  const [profile, couplePartner] = await Promise.all([
    profilePromise,
    couplePartnerPromise,
  ]);

  if (!couplePartner) {
    return null;
  }

  const list = await prisma.shoppingList.findUnique({
    where: {
      id: listId,
      coupleId: couplePartner.coupleId,
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

  if (!list) {
    return null;
  }

  const items: ShoppingListItemDto[] = list.items.map((item) => ({
    id: item.id,
    name: item.name,
    note: item.note,
    quantity: item.quantity,
    createdAt: item.createdAt.toISOString(),
    addedBy: {
      displayName: item.addedBy?.displayName ?? "メンバー",
    },
    state: item.state
      ? {
          isChecked: item.state.isChecked,
          checkedAt: item.state.checkedAt
            ? item.state.checkedAt.toISOString()
            : null,
        }
      : null,
  }));

  const currentUserDisplayName = profile?.displayName ?? "あなた";

  return {
    listId: list.id,
    coupleId: list.coupleId,
    items,
    currentUserDisplayName,
  };
}

const listDetailDataCache = unstable_cache(
  fetchListDetailData,
  ["list-detail-data"],
  {
    revalidate: CACHE_TTL_SECONDS,
  },
);

export async function getListDetailData(userId: string, listId: string) {
  return listDetailDataCache(userId, listId);
}

export async function getListDetailDataFresh(userId: string, listId: string) {
  return fetchListDetailData(userId, listId);
}
