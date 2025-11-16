import Link from "next/link";
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

        <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-8 text-center">
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">
            共有スペースがまだ作成されていません。
            <br />
            プロフィール画面からスペースを作成してください。
          </p>
          <Link
            href="/settings/profile"
            className="inline-block rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)]"
          >
            プロフィール画面へ
          </Link>
        </div>
      </div>
    );
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
