"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/server/services/calendarService";

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

  const normalizedDescription =
    typeof description === "string" && description.trim() !== ""
      ? description.trim()
      : null;
  const normalizedStartTime = typeof startTime === "string" ? startTime : null;
  const normalizedEndDate =
    typeof endDate === "string" && endDate !== "" ? endDate : null;
  const normalizedEndTime =
    typeof endTime === "string" && endTime !== "" ? endTime : null;
  const normalizedColor =
    typeof color === "string" && color !== "" ? color : null;

  await createCalendarEvent({
    userId: user.id,
    coupleId,
    title: title.trim(),
    description: normalizedDescription,
    startDate,
    startTime: normalizedStartTime,
    endDate: normalizedEndDate,
    endTime: normalizedEndTime,
    isAllDay,
    color: normalizedColor,
  });

  revalidatePath("/calendar");
}

export async function updateEventAction(formData: FormData) {
  const user = await requireUser();
  const eventId = formData.get("eventId");
  const title = formData.get("title");
  const description = formData.get("description");
  const startDate = formData.get("startDate");
  const startTime = formData.get("startTime");
  const endDate = formData.get("endDate");
  const endTime = formData.get("endTime");
  const isAllDay = formData.get("isAllDay") === "true";
  const color = formData.get("color");

  if (typeof eventId !== "string") {
    throw new Error("無効なパラメータです");
  }

  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("タイトルを入力してください");
  }

  if (typeof startDate !== "string" || startDate === "") {
    throw new Error("開始日を入力してください");
  }

  const normalizedDescription =
    typeof description === "string" && description.trim() !== ""
      ? description.trim()
      : null;
  const normalizedStartTime = typeof startTime === "string" ? startTime : null;
  const normalizedEndDate =
    typeof endDate === "string" && endDate !== "" ? endDate : null;
  const normalizedEndTime =
    typeof endTime === "string" && endTime !== "" ? endTime : null;
  const normalizedColor =
    typeof color === "string" && color !== "" ? color : null;

  await updateCalendarEvent({
    userId: user.id,
    eventId,
    title: title.trim(),
    description: normalizedDescription,
    startDate,
    startTime: normalizedStartTime,
    endDate: normalizedEndDate,
    endTime: normalizedEndTime,
    isAllDay,
    color: normalizedColor,
  });

  revalidatePath("/calendar");
}

export async function deleteEventAction(eventId: string) {
  const user = await requireUser();

  await deleteCalendarEvent({
    userId: user.id,
    eventId,
  });

  revalidatePath("/calendar");
}
