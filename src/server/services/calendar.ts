import { unstable_cache } from "next/cache";
import type { CalendarEventViewModel } from "@/features/calendar/types";
import { prisma } from "@/lib/prisma";
import { CACHE_TTL_SECONDS } from "@/server/cache/policy";

export type CalendarData = {
  events: CalendarEventViewModel[];
  userSpaceIds: string[];
  profileDisplayName: string | null;
};

async function fetchCalendarData(userId: string): Promise<CalendarData> {
  const profilePromise = prisma.profile.findUnique({
    where: { id: userId },
    select: { displayName: true },
  });

  const partnersPromise = prisma.couplePartner.findMany({
    where: { profileId: userId },
    select: { coupleId: true },
  });

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

  const eventsData = await prisma.calendarEvent.findMany({
    where: { coupleId: { in: userSpaceIds } },
    orderBy: { startAt: "asc" },
    include: {
      createdBy: {
        select: { displayName: true },
      },
    },
  });

  const events: CalendarEventViewModel[] = eventsData.map((event) => ({
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
  }));

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

export async function getCalendarDataFresh(userId: string) {
  return fetchCalendarData(userId);
}
