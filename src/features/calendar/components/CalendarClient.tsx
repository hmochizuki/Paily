"use client";

import { useState } from "react";
import type { CalendarEventViewModel } from "../types";
import { CalendarView } from "./CalendarView";

type ViewMode = "month" | "week";

type CalendarClientProps = {
  coupleId: string;
  events: CalendarEventViewModel[];
};

export function CalendarClient({ coupleId, events }: CalendarClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  return (
    <div className="relative flex h-full flex-1 flex-col">
      <CalendarView
        events={events}
        coupleId={coupleId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  );
}
