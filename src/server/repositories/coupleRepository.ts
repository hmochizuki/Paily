import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getClient(tx?: Prisma.TransactionClient) {
  return tx ?? prisma;
}

export function findCouplePartnerByProfileId(
  profileId: string,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).couplePartner.findFirst({
    where: { profileId },
    select: { coupleId: true },
  });
}

export function findCouplePartnerByProfileAndCouple(
  profileId: string,
  coupleId: string,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).couplePartner.findFirst({
    where: {
      profileId,
      coupleId,
    },
  });
}

export function listCouplePartnersByProfileId(profileId: string) {
  return prisma.couplePartner.findMany({
    where: { profileId },
    select: { coupleId: true },
  });
}

export function createCouple(coupleId: string, tx?: Prisma.TransactionClient) {
  return getClient(tx).couple.create({
    data: {
      id: coupleId,
    },
  });
}

export function createCouplePartner(
  data: Prisma.CouplePartnerUncheckedCreateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).couplePartner.create({ data });
}

export function findPendingInviteByCode(code: string) {
  return prisma.partnerInvite.findFirst({
    where: {
      code,
      status: "pending",
    },
    include: {
      couple: {
        include: {
          partners: true,
        },
      },
    },
  });
}

export function createPartnerInvite(
  data: Prisma.PartnerInviteUncheckedCreateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).partnerInvite.create({ data });
}

export function updatePartnerInvite(
  id: string,
  data: Prisma.PartnerInviteUncheckedUpdateInput,
  tx?: Prisma.TransactionClient,
) {
  return getClient(tx).partnerInvite.update({
    where: { id },
    data,
  });
}
