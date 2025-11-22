import { Suspense } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { CalendarPageContent } from "@/features/calendar/components/CalendarPageContent";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarPageSkeleton } from "./_components/CalendarPageSkeleton";

export const metadata = {
  title: "カレンダー",
};

export default function CalendarPage() {
  return (
    <div className="flex h-full flex-1 flex-col px-4 pb-4 pt-2">
      <Suspense fallback={<CalendarPageSkeleton />}>
        <CalendarDataSection />
      </Suspense>
    </div>
  );
}

type CalendarData = {
  userSpaceIds: string[];
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
    isAllDay: boolean;
    color: string | null;
    coupleId: string;
    createdBy: {
      displayName: string;
    };
  }>;
  profileDisplayName: string | null;
};

const getCalendarData = unstable_cache(
  async (userId: string): Promise<CalendarData> => {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { displayName: true },
    });

    const couplePartners = await prisma.couplePartner.findMany({
      where: { profileId: userId },
      select: { coupleId: true },
    });

    if (couplePartners.length === 0) {
      return {
        userSpaceIds: [],
        events: [],
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

    const events = eventsData.map((event) => ({
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
      userSpaceIds,
      events,
      profileDisplayName: profile?.displayName ?? null,
    };
  },
  ["calendar-data"],
  { revalidate: 60 },
);

async function CalendarDataSection() {
  const user = await requireUser();
  const cached = await getCalendarData(user.id);

  if (cached.userSpaceIds.length === 0) {
    return <NoSpaceMessage />;
  }

  const currentUserDisplayName =
    cached.profileDisplayName ?? user.email ?? "あなた";

  return (
    <CalendarPageContent
      allEvents={cached.events}
      userSpaceIds={cached.userSpaceIds}
      currentUserDisplayName={currentUserDisplayName}
    />
  );
}

function NoSpaceMessage() {
  return (
    <div className="space-y-6 w-full pb-24 pt-2">
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
