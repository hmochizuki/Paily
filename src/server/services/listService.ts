import { unstable_cache } from "next/cache";
import type { ShoppingListItemDto } from "@/features/shopping-list/types";
import { CACHE_TTL_SECONDS } from "@/server/cache/policy";
import {
  findCouplePartnerByProfileId,
  listCouplePartnersByProfileId,
} from "@/server/repositories/coupleRepository";
import { findProfileDisplayName } from "@/server/repositories/profileRepository";
import {
  findShoppingListDetail,
  findShoppingListsByCoupleIds,
  findShoppingListTitle,
} from "@/server/repositories/shoppingListRepository";

type ListOverviewDto = {
  id: string;
  title: string;
  coupleId: string;
  isActive: boolean;
  updatedAt: string;
  uncheckedItemCount: number;
};

type ListsData = {
  userSpaceIds: string[];
  lists: ListOverviewDto[];
};

async function fetchListsData(userId: string): Promise<ListsData> {
  const couplePartners = await listCouplePartnersByProfileId(userId);

  if (couplePartners.length === 0) {
    return { userSpaceIds: [], lists: [] };
  }

  const userSpaceIds = couplePartners.map((cp) => cp.coupleId);

  const lists = await findShoppingListsByCoupleIds(userSpaceIds);

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

type ListDetailData = {
  listId: string;
  coupleId: string;
  items: ShoppingListItemDto[];
  currentUserDisplayName: string;
};

async function fetchListDetailData(
  userId: string,
  listId: string,
): Promise<ListDetailData | null> {
  const profilePromise = findProfileDisplayName(userId);
  const couplePartnerPromise = findCouplePartnerByProfileId(userId);

  const [profile, couplePartner] = await Promise.all([
    profilePromise,
    couplePartnerPromise,
  ]);

  if (!couplePartner) {
    return null;
  }

  const list = await findShoppingListDetail(listId, couplePartner.coupleId);

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

export async function getShoppingListTitle(listId: string) {
  const list = await findShoppingListTitle(listId);

  return list?.title ?? null;
}
