"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { updateProfileDisplayName } from "@/server/services/profileService";

export async function updateDisplayNameAction(formData: FormData) {
  const user = await requireUser();
  const displayName = formData.get("displayName");

  if (typeof displayName !== "string" || displayName.trim() === "") {
    throw new Error("表示名を入力してください");
  }

  if (displayName.trim().length > 50) {
    throw new Error("表示名は50文字以内で入力してください");
  }

  await updateProfileDisplayName(user.id, displayName.trim());

  revalidatePath("/settings/profile");
}
