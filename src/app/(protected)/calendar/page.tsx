import { redirect } from "next/navigation";
import { CalendarView } from "@/features/calendar/components/CalendarView";
import { CreateEventButton } from "@/features/calendar/components/CreateEventButton";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "カレンダー",
};

export default async function CalendarPage() {
  const user = await requireUser();

  const couplePartner = await prisma.couplePartner.findFirst({
    where: { profileId: user.id },
    select: { coupleId: true },
  });

  if (!couplePartner) {
    redirect("/couple/create");
  }

  const eventsData = await prisma.calendarEvent.findMany({
    where: { coupleId: couplePartner.coupleId },
    orderBy: { startAt: "asc" },
    include: {
      createdBy: {
        select: { displayName: true },
      },
    },
  });

  const events = eventsData.map((event) => ({
    ...event,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt ? event.endAt.toISOString() : null,
  }));

  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          カレンダー
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          ふたりの予定を共有できます。
        </p>
      </div>

      <CalendarView events={events} coupleId={couplePartner.coupleId} />

      <CreateEventButton coupleId={couplePartner.coupleId} />
    </div>
  );
}
