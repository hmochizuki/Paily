import { notFound } from "next/navigation";
import { EventEditForm } from "@/features/calendar/components/EventEditForm";
import { requireUser } from "@/lib/auth";
import { getCalendarEventForUser } from "@/server/services/calendarService";

interface EventEditPageProps {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{
    returnTo?: string;
  }>;
}

export const metadata = {
  title: "イベントを編集",
};

export default async function EventEditPage({
  params,
  searchParams,
}: EventEditPageProps) {
  const [{ eventId }, search] = await Promise.all([params, searchParams]);
  const user = await requireUser();
  const event = await getCalendarEventForUser({
    userId: user.id,
    eventId,
  });

  if (!event) {
    notFound();
  }

  return (
    <EventEditForm event={event} returnTo={search.returnTo ?? "/calendar"} />
  );
}
