"use client";

import { useEffect, useState } from "react";
import { useSelectedSpace } from "@/hooks/useSelectedSpace";
import { CalendarView } from "./CalendarView";
import { CreateEventButton } from "./CreateEventButton";

interface CalendarEvent {
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
}

interface CalendarPageContentProps {
  allEvents: CalendarEvent[];
  userSpaceIds: string[];
}

export function CalendarPageContent({
  allEvents,
  userSpaceIds,
}: CalendarPageContentProps) {
  const { selectedSpaceId, selectSpace, isLoading } = useSelectedSpace();
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && userSpaceIds.length > 0) {
      const isValidSelection =
        selectedSpaceId && userSpaceIds.includes(selectedSpaceId);
      if (isValidSelection) {
        setCurrentSpaceId(selectedSpaceId);
      } else {
        selectSpace(userSpaceIds[0]);
        setCurrentSpaceId(userSpaceIds[0]);
      }
    }
  }, [isLoading, userSpaceIds, selectedSpaceId, selectSpace]);

  if (isLoading || !currentSpaceId) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-12 rounded bg-gray-200" />
          <div className="mt-4 h-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  const events = allEvents.filter((event) => event.coupleId === currentSpaceId);

  return (
    <>
      <CalendarView events={events} coupleId={currentSpaceId} />
      <CreateEventButton coupleId={currentSpaceId} />
    </>
  );
}
