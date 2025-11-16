"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createEventAction(formData: FormData) {
  const user = await requireUser();
  const coupleId = formData.get("coupleId");
  const title = formData.get("title");
  const description = formData.get("description");
  const startDate = formData.get("startDate");
  const startTime = formData.get("startTime");
  const endDate = formData.get("endDate");
  const endTime = formData.get("endTime");
  const isAllDay = formData.get("isAllDay") === "true";
  const color = formData.get("color");

  if (typeof coupleId !== "string") {
    throw new Error("無効なパラメータです");
  }

  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("タイトルを入力してください");
  }

  if (typeof startDate !== "string" || startDate === "") {
    throw new Error("開始日を入力してください");
  }

  const couplePartner = await prisma.couplePartner.findFirst({
    where: {
      profileId: user.id,
      coupleId: coupleId,
    },
  });

  if (!couplePartner) {
    throw new Error("このカレンダーにアクセスする権限がありません");
  }

  let startAt: Date;
  let endAt: Date | null = null;

  if (isAllDay) {
    startAt = new Date(`${startDate}T00:00:00+09:00`);
    if (typeof endDate === "string" && endDate !== "") {
      endAt = new Date(`${endDate}T23:59:59+09:00`);
    }
  } else {
    const startTimeValue =
      typeof startTime === "string" && startTime !== "" ? startTime : "00:00";
    startAt = new Date(`${startDate}T${startTimeValue}:00+09:00`);
    if (
      typeof endDate === "string" &&
      endDate !== "" &&
      typeof endTime === "string" &&
      endTime !== ""
    ) {
      endAt = new Date(`${endDate}T${endTime}:00+09:00`);
    }
  }

  await prisma.calendarEvent.create({
    data: {
      id: crypto.randomUUID(),
      coupleId: coupleId,
      createdById: user.id,
      title: title.trim(),
      description:
        typeof description === "string" && description.trim() !== ""
          ? description.trim()
          : null,
      startAt: startAt,
      endAt: endAt,
      isAllDay: isAllDay,
      color: typeof color === "string" && color !== "" ? color : null,
    },
  });

  revalidatePath("/calendar");
}
