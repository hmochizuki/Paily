import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TTL_SECONDS } from "@/server/cache/policy";

export type ListOverview = {
  id: string;
  title: string;
  coupleId: string;
  isActive: boolean;
  updatedAt: string;
  _count: {
    items: number;
  };
};

export type ListsData = {
  userSpaceIds: string[];
  lists: ListOverview[];
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
      _count: {
        select: { items: true },
      },
    },
  });

  const serialized: ListOverview[] = lists.map((list) => ({
    id: list.id,
    title: list.title,
    coupleId: list.coupleId,
    isActive: list.isActive,
    updatedAt: list.updatedAt.toISOString(),
    _count: list._count,
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
