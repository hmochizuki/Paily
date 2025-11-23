import { unstable_cache } from "next/cache";
import type { SpaceDto } from "@/features/space/types";
import { prisma } from "@/lib/prisma";
import { CACHE_TTL_SECONDS } from "@/server/cache/policy";

type ProfileSettingsData = {
  profile: {
    displayName: string;
    gender: string | null;
    avatarUrl: string | null;
  } | null;
  spaces: SpaceDto[];
};

async function fetchProfileSettingsData(
  userId: string,
): Promise<ProfileSettingsData> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    include: {
      couples: {
        include: {
          couple: {
            include: {
              partners: {
                include: {
                  profile: {
                    select: { displayName: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) {
    return { profile: null, spaces: [] };
  }

  const spaces = profile.couples.map((cp) => ({
    id: cp.couple.id,
    createdAt: cp.couple.createdAt.toISOString(),
    partners: cp.couple.partners.map((partner) => ({
      profile: {
        displayName: partner.profile.displayName,
      },
    })),
  }));

  return {
    profile: {
      displayName: profile.displayName,
      gender: profile.gender,
      avatarUrl: profile.avatarUrl,
    },
    spaces,
  };
}

const profileSettingsCache = unstable_cache(
  fetchProfileSettingsData,
  ["profile-settings"],
  {
    revalidate: CACHE_TTL_SECONDS,
  },
);

export async function getProfileSettingsData(userId: string) {
  return profileSettingsCache(userId);
}
