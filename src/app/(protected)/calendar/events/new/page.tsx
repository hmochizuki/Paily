import { notFound } from "next/navigation";
import { EventCreateForm } from "@/features/calendar/components/EventCreateForm";
import { parseDateKey } from "@/features/calendar/utils/dateUtils";
import { requireUser } from "@/lib/auth";
import { getCalendarData } from "@/server/services/calendarService";

interface EventCreatePageProps {
  searchParams: Promise<{
    spaceId?: string;
    date?: string;
    returnTo?: string;
  }>;
}

export const metadata = {
  title: "イベントを作成",
};

export default async function EventCreatePage({
  searchParams,
}: EventCreatePageProps) {
  const search = await searchParams;
  const user = await requireUser();
  const calendarData = await getCalendarData(user.id);

  const { spaceId } = search;
  if (!spaceId || !calendarData.userSpaceIds.includes(spaceId)) {
    notFound();
  }

  const parsedDate = search.date ? parseDateKey(search.date) : null;
  const initialDate = parsedDate ?? new Date();

  return (
    <EventCreateForm
      coupleId={spaceId}
      initialDateIso={initialDate.toISOString()}
      returnTo={search.returnTo ?? "/calendar"}
    />
  );
}
