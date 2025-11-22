import { Suspense } from "react";
import Link from "next/link";
import { CalendarPageContent } from "@/features/calendar/components/CalendarPageContent";
import { requireUser } from "@/lib/auth";
import { getCalendarData } from "@/server/services/calendar";
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
      allEventsDto={cached.events}
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
