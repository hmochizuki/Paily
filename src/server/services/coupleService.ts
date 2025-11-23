import { Prisma } from "@prisma/client";
import type { User } from "@supabase/supabase-js";
import {
  createCouple,
  createCouplePartner,
  createPartnerInvite,
  findCouplePartnerByProfileAndCouple,
  findCouplePartnerByProfileId,
  findPendingInviteByCode,
  updatePartnerInvite,
} from "@/server/repositories/coupleRepository";
import {
  createProfile,
  findProfileById,
} from "@/server/repositories/profileRepository";
import { runTransaction } from "@/server/repositories/transaction";
import { generateInviteCode } from "@/utils/invite-code";

export type CoupleServiceErrorCode =
  | "400"
  | "401"
  | "403"
  | "404"
  | "409"
  | "410"
  | "500";

export class CoupleServiceError extends Error {
  code: CoupleServiceErrorCode;

  constructor(code: CoupleServiceErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "CoupleServiceError";
  }
}

export async function getCouplePartnerByProfileId(profileId: string) {
  return findCouplePartnerByProfileId(profileId);
}

export async function getCouplePartnerByProfileAndCouple(
  profileId: string,
  coupleId: string,
) {
  return findCouplePartnerByProfileAndCouple(profileId, coupleId);
}

function resolveDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata?.full_name === "string" ? metadata.full_name.trim() : null;
  const name = typeof metadata?.name === "string" ? metadata.name.trim() : null;

  return fullName && fullName !== ""
    ? fullName
    : name && name !== ""
      ? name
      : (user.email?.split("@")[0] ?? "メンバー");
}

async function ensureProfile(user: User, tx: Prisma.TransactionClient) {
  const existingProfile = await findProfileById(user.id, tx);

  if (existingProfile) {
    return existingProfile;
  }

  const metadata = user.user_metadata ?? {};
  return createProfile(
    {
      id: user.id,
      displayName: resolveDisplayName(user),
      avatarUrl:
        typeof metadata?.avatar_url === "string"
          ? (metadata.avatar_url as string)
          : null,
      gender:
        typeof metadata?.gender === "string"
          ? (metadata.gender as string)
          : null,
    },
    tx,
  );
}

async function ensureCoupleForUser(
  userId: string,
  tx: Prisma.TransactionClient,
) {
  const membership = await findCouplePartnerByProfileId(userId, tx);

  if (membership?.coupleId) {
    return membership.coupleId;
  }

  const coupleId = crypto.randomUUID();
  await createCouple(coupleId, tx);
  await createCouplePartner(
    {
      coupleId,
      profileId: userId,
      status: "active",
    },
    tx,
  );

  return coupleId;
}

export async function createCoupleInvitation(params: {
  user: User;
  inviteEmail: string;
  initialCode: string;
  inviteId: string;
  expiresAt: Date;
}) {
  const { user, inviteEmail, initialCode, inviteId, expiresAt } = params;

  return runTransaction(async (tx) => {
    await ensureProfile(user, tx);
    const coupleId = await ensureCoupleForUser(user.id, tx);

    let codeToUse = initialCode;
    while (true) {
      try {
        await createPartnerInvite(
          {
            id: inviteId,
            coupleId,
            email: inviteEmail,
            inviterProfileId: user.id,
            code: codeToUse,
            expiresAt,
          },
          tx,
        );
        return { coupleId, finalCode: codeToUse };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          codeToUse = generateInviteCode(initialCode.length);
          continue;
        }
        throw error;
      }
    }
  });
}

export async function acceptCoupleInvitation(params: {
  user: User;
  inviteCode: string;
}) {
  const { user, inviteCode } = params;

  const invite = await findPendingInviteByCode(inviteCode);

  if (!invite) {
    throw new CoupleServiceError("404", "招待コードが見つかりません。");
  }

  if (invite.expiresAt < new Date()) {
    throw new CoupleServiceError("410", "招待コードの有効期限が切れています。");
  }

  if (!invite.coupleId) {
    throw new CoupleServiceError("400", "招待が無効です。");
  }

  if (invite.inviterProfileId === user.id) {
    throw new CoupleServiceError("400", "自分の招待コードは使用できません。");
  }

  const existingMembership = await findCouplePartnerByProfileId(user.id);

  if (existingMembership) {
    throw new CoupleServiceError("409", "既にカップルに参加しています。");
  }

  if (invite.couple?.partners && invite.couple.partners.length >= 2) {
    throw new CoupleServiceError("409", "このカップルは既に満員です。");
  }

  await runTransaction(async (tx) => {
    await ensureProfile(user, tx);

    await createCouplePartner(
      {
        coupleId: invite.coupleId ?? "",
        profileId: user.id,
        status: "active",
      },
      tx,
    );

    await updatePartnerInvite(
      invite.id,
      {
        status: "accepted",
        acceptedProfileId: user.id ?? undefined,
      },
      tx,
    );
  });

  return { coupleId: invite.coupleId };
}
