import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getClient(tx?: Prisma.TransactionClient) {
  return tx ?? prisma;
}

export function findProfileById(
  profileId: string,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).profile.findUnique({
    where: { id: profileId },
  });
}

export function findProfileDisplayName(
  profileId: string,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).profile.findUnique({
    where: { id: profileId },
    select: { displayName: true },
  });
}

export function findProfileWithCouples(profileId: string) {
  return prisma.profile.findUnique({
    where: { id: profileId },
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
}

export function createProfile(
  data: Prisma.ProfileCreateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).profile.create({ data });
}

export function updateProfile(
  profileId: string,
  data: Prisma.ProfileUpdateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).profile.update({
    where: { id: profileId },
    data,
  });
}
