"use client";

import type { CalendarEventViewModel } from "../types";
import { CalendarView } from "./CalendarView";

interface CalendarClientProps {
  coupleId: string;
  events: CalendarEventViewModel[];
}

export function CalendarClient({ coupleId, events }: CalendarClientProps) {
  return (
    <div className="relative flex h-full flex-1 flex-col">
      <CalendarView events={events} coupleId={coupleId} />
    </div>
  );
}
