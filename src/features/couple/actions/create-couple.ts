"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateInviteCode, INVITE_CODE_REGEX } from "@/utils/invite-code";

export type CreateCoupleState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; inviteCode: string; inviteUrl: string };

function errorState(message: string): CreateCoupleState {
  return { status: "error", message };
}

export async function createCoupleAction(
  _prevState: CreateCoupleState,
  formData: FormData,
): Promise<CreateCoupleState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError) {
    console.error("Failed to fetch Supabase user", sessionError);
    return errorState(
      "認証情報を取得できませんでした。再度ログインしてください。",
    );
  }

  if (!user) {
    redirect("/");
  }

  const timezone = "Asia/Tokyo";
  const origin = (formData.get("origin") as string | null)?.trim() ?? "";
  const inviteCodeInput = (formData.get("inviteCode") as string | null)?.trim();

  let finalCode = inviteCodeInput
    ? inviteCodeInput.toUpperCase()
    : generateInviteCode(6);
  if (!INVITE_CODE_REGEX.test(finalCode)) {
    return errorState("招待コードは英字4〜12文字で指定してください。");
  }

  const coupleId = crypto.randomUUID();
  const inviteId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  try {
    await prisma.$transaction(async (tx) => {
      const emptyCode = (code: string) => code === "";

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

      await tx.couple.create({
        data: {
          id: coupleId,
          timezone,
        },
      });

      await tx.couplePartner.create({
        data: {
          coupleId,
          profileId: user.id,
        },
      });

      let attempts = 0;
      while (attempts < 5) {
        try {
          await tx.partnerInvite.create({
            data: {
              id: inviteId,
              coupleId,
              email: user.email?.toLowerCase() ?? "",
              inviterProfileId: user.id,
              code: finalCode,
              expiresAt,
            },
          });
          break;
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            finalCode = generateInviteCode(finalCode.length);
            attempts += 1;
            continue;
          }
          throw error;
        }
      }

      if (attempts === 5) {
        throw new Error("Failed to generate unique invite code");
      }
    });
  } catch (error) {
    console.error("Failed to create couple", error);
    return errorState(
      "スペースの作成に失敗しました。時間をおいて再度お試しください。",
    );
  }

  revalidatePath("/couple/create");
  revalidatePath("/couple/invitations");

  const inviteUrl = origin ? `${origin}/invite/${finalCode}` : `/invite/${finalCode}`;
  return { status: "success", inviteCode: finalCode, inviteUrl };
}
