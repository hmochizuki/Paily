import { notFound } from "next/navigation";
import type { CalendarEventDto } from "@/features/calendar/types";
import { parseDateKey } from "@/features/calendar/utils/dateUtils";
import { requireUser } from "@/lib/auth";
import { getCalendarData } from "@/server/services/calendarService";
import { DayDetailModalScreen } from "./DayDetailModalScreen";

interface DayDetailPageProps {
  params: Promise<{
    date: string;
  }>;
  searchParams: Promise<{
    spaceId?: string;
    returnTo?: string;
  }>;
}

export async function generateMetadata({ params }: DayDetailPageProps) {
  const { date } = await params;
  return {
    title: `日別イベント | ${date}`,
  };
}

function isEventOnDate(event: CalendarEventDto, targetDate: Date) {
  const eventStart = new Date(event.startAt);
  eventStart.setHours(0, 0, 0, 0);
  const eventEnd = event.endAt
    ? new Date(event.endAt)
    : new Date(event.startAt);
  eventEnd.setHours(23, 59, 59, 999);
  const comparator = new Date(targetDate);
  comparator.setHours(12, 0, 0, 0);
  return comparator >= eventStart && comparator <= eventEnd;
}

function buildCurrentPath(
  date: string,
  spaceId: string,
  returnTo: string | undefined,
) {
  const params = new URLSearchParams();
  params.set("spaceId", spaceId);
  if (returnTo) {
    params.set("returnTo", returnTo);
  }
  const query = params.toString();
  return query.length > 0
    ? `/calendar/days/${date}?${query}`
    : `/calendar/days/${date}`;
}

export default async function DayDetailPage({
  params,
  searchParams,
}: DayDetailPageProps) {
  const [{ date }, search] = await Promise.all([params, searchParams]);
  const parsedDate = parseDateKey(date);
  if (!parsedDate) {
    notFound();
  }

  const user = await requireUser();
  const calendarData = await getCalendarData(user.id);

  if (calendarData.userSpaceIds.length === 0) {
    notFound();
  }

  const resolvedSpaceId =
    search.spaceId && calendarData.userSpaceIds.includes(search.spaceId)
      ? search.spaceId
      : calendarData.userSpaceIds[0];
  const events = calendarData.events.filter(
    (event) =>
      event.coupleId === resolvedSpaceId && isEventOnDate(event, parsedDate),
  );

  const currentPath = buildCurrentPath(date, resolvedSpaceId, search.returnTo);
  const returnTo = search.returnTo ?? "/calendar";

  return (
    <DayDetailModalScreen
      dateKey={date}
      events={events}
      spaceId={resolvedSpaceId}
      currentPath={currentPath}
      returnTo={returnTo}
    />
  );
}
