"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  acceptCoupleInvitation,
  CoupleServiceError,
  type CoupleServiceErrorCode,
  createCoupleInvitation,
} from "@/server/services/coupleService";
import { generateInviteCode, INVITE_CODE_REGEX } from "@/utils/invite-code";

type ErrorCode = CoupleServiceErrorCode;

type CreateCoupleState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      code: ErrorCode;
    }
  | { status: "success"; inviteCode: string; inviteUrl: string };

type AcceptInvitationState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      code: ErrorCode;
    }
  | { status: "success"; coupleId: string };

type ErrorState<T> = Extract<T, { status: "error" }>;

function errorState<T extends CreateCoupleState | AcceptInvitationState>(
  message: string,
  code: ErrorCode,
): ErrorState<T> {
  return { status: "error", message, code } as ErrorState<T>;
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
    const result = await createCoupleInvitation({
      user,
      inviteEmail,
      initialCode,
      inviteId,
      expiresAt,
    });
    finalCode = result.finalCode;
  } catch (error) {
    console.error("Failed to create couple", error);
    const code =
      error instanceof CoupleServiceError ? error.code : ("500" as ErrorCode);
    const message =
      error instanceof CoupleServiceError
        ? error.message
        : "スペースの作成に失敗しました。時間をおいて再度お試しください。";
    return errorState(message, code);
  }

  revalidatePath("/couple/create");
  revalidatePath("/couple/invitations");
  const inviteUrl = origin
    ? `${origin}/invite/${finalCode}`
    : `/invite/${finalCode}`;
  return { status: "success", inviteCode: finalCode, inviteUrl };
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
    const result = await acceptCoupleInvitation({
      user,
      inviteCode,
    });

    revalidatePath("/");
    revalidatePath("/couple");
    return { status: "success", coupleId: result.coupleId };
  } catch (error) {
    console.error("Failed to accept invitation", error);
    const code =
      error instanceof CoupleServiceError ? error.code : ("500" as ErrorCode);
    const message =
      error instanceof CoupleServiceError
        ? error.message
        : "招待の受付に失敗しました。時間をおいて再度お試しください。";
    return errorState(message, code);
  }
}

export type { AcceptInvitationState, CreateCoupleState };
