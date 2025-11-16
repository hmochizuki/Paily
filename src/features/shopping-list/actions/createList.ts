"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createListAction(formData: FormData) {
  const user = await requireUser();
  const title = formData.get("title");
  const coupleId = formData.get("coupleId");

  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("タイトルを入力してください");
  }

  if (typeof coupleId !== "string") {
    throw new Error("カップルIDが無効です");
  }

  const couplePartner = await prisma.couplePartner.findFirst({
    where: {
      profileId: user.id,
      coupleId: coupleId,
    },
  });

  if (!couplePartner) {
    throw new Error("このカップルに所属していません");
  }

  const list = await prisma.shoppingList.create({
    data: {
      id: crypto.randomUUID(),
      coupleId: coupleId,
      title: title.trim(),
    },
  });

  revalidatePath("/lists");
  redirect(`/lists/${list.id}`);
}
