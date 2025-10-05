"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { INVITE_CODE_REGEX } from "@/utils/invite-code";

type ErrorCode = "400" | "401" | "403" | "404" | "409" | "410" | "500";

export type AcceptInvitationState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      code: ErrorCode;
    }
  | { status: "success"; coupleId: string };

function errorState(message: string, code: ErrorCode): AcceptInvitationState {
  return { status: "error", message, code };
}

export async function acceptCoupleInvitationAction(
  _prevState: AcceptInvitationState,
  formData: FormData,
): Promise<AcceptInvitationState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Failed to fetch Supabase user", sessionError);
    return errorState(
      "認証情報を取得できませんでした。再度ログインしてください。",
      "401",
    );
  }

  const user = session?.user;

  if (!user) {
    redirect("/");
  }

  const inviteCodeInput = (formData.get("inviteCode") as string | null)?.trim();

  if (!inviteCodeInput) {
    return errorState("招待コードを入力してください。", "400");
  }

  const inviteCode = inviteCodeInput.toUpperCase();

  if (!INVITE_CODE_REGEX.test(inviteCode)) {
    return errorState("招待コードの形式が正しくありません。", "400");
  }

  try {
    const invite = await prisma.partnerInvite.findFirst({
      where: {
        code: inviteCode,
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

    if (!invite) {
      return errorState("招待コードが見つかりません。", "404");
    }

    if (invite.expiresAt < new Date()) {
      return errorState("招待コードの有効期限が切れています。", "410");
    }

    if (!invite.coupleId) {
      return errorState("招待が無効です。", "400");
    }

    if (invite.inviterProfileId === user.id) {
      return errorState("自分の招待コードは使用できません。", "400");
    }

    const existingMembership = await prisma.couplePartner.findFirst({
      where: { profileId: user.id },
    });

    if (existingMembership) {
      return errorState("既にカップルに参加しています。", "409");
    }

    if (invite.couple?.partners && invite.couple.partners.length >= 2) {
      return errorState("このカップルは既に満員です。", "409");
    }

    await prisma.$transaction(async (tx) => {
      const existingProfile = await tx.profile.findUnique({
        where: { id: user.id },
      });

      if (!existingProfile) {
        const rawName =
          (typeof user.user_metadata?.full_name === "string" &&
            user.user_metadata.full_name.trim()) ||
          (typeof user.user_metadata?.name === "string" &&
            user.user_metadata.name.trim()) ||
          user.email?.split("@")[0] ||
          "メンバー";

        await tx.profile.create({
          data: {
            id: user.id,
            displayName: rawName,
            avatarUrl:
              typeof user.user_metadata?.avatar_url === "string"
                ? user.user_metadata.avatar_url
                : null,
            gender:
              typeof user.user_metadata?.gender === "string"
                ? user.user_metadata.gender
                : null,
          },
        });
      }

      await tx.couplePartner.create({
        data: {
          coupleId: invite.coupleId ?? "",
          profileId: user.id,
          status: "active",
        },
      });

      await tx.partnerInvite.update({
        where: { id: invite.id },
        data: {
          status: "accepted",
          acceptedProfileId: user.id ?? undefined,
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/couple");
    return { status: "success", coupleId: invite.coupleId };
  } catch (error) {
    console.error("Failed to accept invitation", error);
    return errorState(
      "招待の受付に失敗しました。時間をおいて再度お試しください。",
      "500",
    );
  }
}
