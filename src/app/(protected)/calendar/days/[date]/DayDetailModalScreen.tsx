"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { DayDetailModal } from "@/features/calendar/components/DayDetailModal";
import type { CalendarEventDto } from "@/features/calendar/types";
import { toCalendarEventViewModels } from "@/features/calendar/types";
import { parseDateKey } from "@/features/calendar/utils/dateUtils";

interface DayDetailModalScreenProps {
  dateKey: string;
  events: CalendarEventDto[];
  spaceId: string;
  currentPath: string;
  returnTo: string;
}

const MODAL_TRANSITION_MS = 300;

export function DayDetailModalScreen({
  dateKey,
  events,
  spaceId,
  currentPath,
  returnTo,
}: DayDetailModalScreenProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const date = parseDateKey(dateKey);
  const calendarEvents = useMemo(
    () => toCalendarEventViewModels(events),
    [events],
  );

  const closeTarget = returnTo || "/calendar";
  const encodedCurrentPath = encodeURIComponent(currentPath);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => {
      router.push(closeTarget);
    }, MODAL_TRANSITION_MS);
  }, [closeTarget, router]);

  const handleAddEvent = useCallback(() => {
    router.push(
      `/calendar/events/new?spaceId=${spaceId}&date=${dateKey}&returnTo=${encodedCurrentPath}`,
    );
  }, [router, spaceId, dateKey, encodedCurrentPath]);

  const handleEditEvent = useCallback(
    (eventId: string) => {
      router.push(
        `/calendar/days/${dateKey}/events/${eventId}?returnTo=${encodedCurrentPath}`,
      );
    },
    [router, dateKey, encodedCurrentPath],
  );

  if (!date) {
    return null;
  }

  return (
    <DayDetailModal
      key={dateKey}
      date={date}
      events={calendarEvents}
      isOpen={isOpen}
      onClose={handleClose}
      onAddEvent={handleAddEvent}
      onEditEvent={handleEditEvent}
    />
  );
}
