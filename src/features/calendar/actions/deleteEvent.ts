"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteEventAction(eventId: string) {
  const user = await requireUser();

  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: { coupleId: true },
  });

  if (!event) {
    throw new Error("イベントが見つかりません");
  }

  const couplePartner = await prisma.couplePartner.findFirst({
    where: {
      profileId: user.id,
      coupleId: event.coupleId,
    },
  });

  if (!couplePartner) {
    throw new Error("このイベントを削除する権限がありません");
  }

  await prisma.calendarEvent.delete({
    where: { id: eventId },
  });

  revalidatePath("/calendar");
}
