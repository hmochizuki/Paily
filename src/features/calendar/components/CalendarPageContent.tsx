"use client";

import { useEffect, useState } from "react";
import { useSelectedSpace } from "@/hooks/useSelectedSpace";
import type { CalendarEventViewModel } from "../types";
import { CalendarClient } from "./CalendarClient";

interface CalendarPageContentProps {
  allEvents: CalendarEventViewModel[];
  userSpaceIds: string[];
  currentUserDisplayName: string;
}

export function CalendarPageContent({
  allEvents,
  userSpaceIds,
  currentUserDisplayName,
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
    <CalendarClient
      coupleId={currentSpaceId}
      initialEvents={events}
      currentUserDisplayName={currentUserDisplayName}
    />
  );
}
