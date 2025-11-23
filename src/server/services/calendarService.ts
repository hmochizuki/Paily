import { unstable_cache } from "next/cache";
import type { CalendarEventDto } from "@/features/calendar/types";
import { CACHE_TTL_SECONDS } from "@/server/cache/policy";
import {
  createEvent,
  deleteEvent,
  findEventById,
  findEventCoupleId,
  findEventsByCoupleIds,
  updateEvent,
} from "@/server/repositories/calendarRepository";
import { listCouplePartnersByProfileId } from "@/server/repositories/coupleRepository";
import { findProfileDisplayName } from "@/server/repositories/profileRepository";
import { getCouplePartnerByProfileAndCouple } from "@/server/services/coupleService";

type CalendarData = {
  events: CalendarEventDto[];
  userSpaceIds: string[];
  profileDisplayName: string | null;
};

type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  isAllDay: boolean;
  color: string | null;
  coupleId: string;
  createdBy?: {
    displayName: string | null;
  } | null;
};

function buildCalendarEventDto(event: EventRecord): CalendarEventDto {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt ? event.endAt.toISOString() : null,
    isAllDay: event.isAllDay,
    color: event.color,
    coupleId: event.coupleId,
    createdBy: {
      displayName: event.createdBy?.displayName ?? "メンバー",
    },
  };
}

async function fetchCalendarData(userId: string): Promise<CalendarData> {
  const profilePromise = findProfileDisplayName(userId);
  const partnersPromise = listCouplePartnersByProfileId(userId);

  const [profile, couplePartners] = await Promise.all([
    profilePromise,
    partnersPromise,
  ]);

  if (couplePartners.length === 0) {
    return {
      events: [],
      userSpaceIds: [],
      profileDisplayName: profile?.displayName ?? null,
    };
  }

  const userSpaceIds = couplePartners.map((cp) => cp.coupleId);

  const eventsData = await findEventsByCoupleIds(userSpaceIds);

  const events: CalendarEventDto[] = eventsData.map((event) =>
    buildCalendarEventDto(event),
  );

  return {
    events,
    userSpaceIds,
    profileDisplayName: profile?.displayName ?? null,
  };
}

const calendarDataCache = unstable_cache(fetchCalendarData, ["calendar-data"], {
  revalidate: CACHE_TTL_SECONDS,
});

export async function getCalendarData(userId: string) {
  return calendarDataCache(userId);
}

function resolveDateRange(
  startDate: string,
  isAllDay: boolean,
  startTime: string | null,
  endDate: string | null,
  endTime: string | null,
) {
  let startAt: Date;
  let endAt: Date | null = null;

  if (isAllDay) {
    startAt = new Date(`${startDate}T00:00:00+09:00`);
    if (endDate) {
      endAt = new Date(`${endDate}T23:59:59+09:00`);
    }
  } else {
    const startTimeValue = startTime && startTime !== "" ? startTime : "00:00";
    startAt = new Date(`${startDate}T${startTimeValue}:00+09:00`);
    if (endDate && endTime) {
      endAt = new Date(`${endDate}T${endTime}:00+09:00`);
    }
  }

  return { startAt, endAt };
}

export async function createCalendarEvent(params: {
  userId: string;
  coupleId: string;
  title: string;
  description: string | null;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  isAllDay: boolean;
  color: string | null;
}) {
  const membership = await getCouplePartnerByProfileAndCouple(
    params.userId,
    params.coupleId,
  );

  if (!membership) {
    throw new Error("このカレンダーにアクセスする権限がありません");
  }

  const { startAt, endAt } = resolveDateRange(
    params.startDate,
    params.isAllDay,
    params.startTime,
    params.endDate,
    params.endTime,
  );

  await createEvent({
    id: crypto.randomUUID(),
    coupleId: params.coupleId,
    createdById: params.userId,
    title: params.title,
    description: params.description,
    startAt,
    endAt,
    isAllDay: params.isAllDay,
    color: params.color,
  });
}

export async function updateCalendarEvent(params: {
  userId: string;
  eventId: string;
  title: string;
  description: string | null;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  isAllDay: boolean;
  color: string | null;
}) {
  const event = await findEventById(params.eventId);

  if (!event) {
    throw new Error("イベントが見つかりません");
  }

  const hasAccess = event.couple.partners.some(
    (partner) => partner.profileId === params.userId,
  );

  if (!hasAccess) {
    throw new Error("このイベントを編集する権限がありません");
  }

  const { startAt, endAt } = resolveDateRange(
    params.startDate,
    params.isAllDay,
    params.startTime,
    params.endDate,
    params.endTime,
  );

  await updateEvent(params.eventId, {
    title: params.title,
    description: params.description,
    startAt,
    endAt,
    isAllDay: params.isAllDay,
    color: params.color,
  });
}

export async function deleteCalendarEvent(params: {
  userId: string;
  eventId: string;
}) {
  const event = await findEventCoupleId(params.eventId);

  if (!event) {
    throw new Error("イベントが見つかりません");
  }

  const membership = await getCouplePartnerByProfileAndCouple(
    params.userId,
    event.coupleId,
  );

  if (!membership) {
    throw new Error("このイベントを削除する権限がありません");
  }
  await deleteEvent(params.eventId);
}

export async function getCalendarEventForUser(params: {
  userId: string;
  eventId: string;
}) {
  const event = await findEventById(params.eventId);

  if (!event) {
    return null;
  }

  const hasAccess = event.couple.partners.some(
    (partner) => partner.profileId === params.userId,
  );

  if (!hasAccess) {
    throw new Error("このイベントにアクセスする権限がありません");
  }

  return buildCalendarEventDto(event);
}
