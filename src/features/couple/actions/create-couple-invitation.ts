"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { generateInviteCode, INVITE_CODE_REGEX } from "@/utils/invite-code";

type ErrorCode = "400" | "401" | "403" | "404" | "500";

export type CreateCoupleState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      code: ErrorCode;
    }
  | { status: "success"; inviteCode: string; inviteUrl: string };

function errorState(message: string, code: ErrorCode): CreateCoupleState {
  return { status: "error", message, code };
}

export async function createCoupleInvitationAction(
  _prevState: CreateCoupleState,
  formData: FormData,
): Promise<CreateCoupleState> {
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

  const origin = (formData.get("origin") as string | null)?.trim() ?? "";
  const inviteCodeInput = (formData.get("inviteCode") as string | null)?.trim();
  const inviteEmailInput = (
    formData.get("inviteEmail") as string | null
  )?.trim();

  const initialCode = inviteCodeInput
    ? inviteCodeInput.toUpperCase()
    : generateInviteCode(6);
  if (!INVITE_CODE_REGEX.test(initialCode)) {
    return errorState("招待コードは英字4〜12文字で指定してください。", "400");
  }

  const inviteEmail = inviteEmailInput?.toLowerCase() ?? null;
  if (!inviteEmail) {
    return errorState("招待メールアドレスを入力してください。", "400");
  }

  const inviteId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  let finalCode = initialCode;

  try {
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

      const membership = await tx.couplePartner.findFirst({
        where: { profileId: user.id },
        select: { coupleId: true },
      });

      let coupleId = membership?.coupleId;

      if (!coupleId) {
        coupleId = crypto.randomUUID();

        await tx.couple.create({
          data: {
            id: coupleId,
          },
        });

        await tx.couplePartner.create({
          data: {
            coupleId,
            profileId: user.id,
            status: "active",
          },
        });
      }

      let codeToUse = initialCode;

      while (true) {
        try {
          await tx.partnerInvite.create({
            data: {
              id: inviteId,
              coupleId,
              email: inviteEmail,
              inviterProfileId: user.id,
              code: codeToUse,
              expiresAt,
            },
          });
          finalCode = codeToUse;
          break;
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            codeToUse = generateInviteCode(codeToUse.length);
            continue;
          }
          throw error;
        }
      }
    });
  } catch (error) {
    console.error("Failed to create couple", error);
    return errorState(
      "スペースの作成に失敗しました。時間をおいて再度お試しください。",
      "500",
    );
  }

  revalidatePath("/couple/create");
  revalidatePath("/couple/invitations");
  const inviteUrl = origin
    ? `${origin}/invite/${finalCode}`
    : `/invite/${finalCode}`;
  return { status: "success", inviteCode: finalCode, inviteUrl };
}
