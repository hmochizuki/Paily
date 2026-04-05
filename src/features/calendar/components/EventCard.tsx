"use client";

import type { CalendarEventViewModel } from "../types";

type EventCardProps = {
  event: CalendarEventViewModel;
  onClick: () => void;
  partnerColor?: string;
};

const COLOR_CLASSES: Record<string, string> = {
  pink: "bg-pink-400",
  red: "bg-red-400",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
};

export function EventCard({ event, onClick, partnerColor }: EventCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const containerClasses = [
    "w-full rounded-lg border border-[var(--color-border-default)] bg-white p-3 text-left transition-colors hover:bg-[var(--color-bg-subtle)]",
    event.isOptimistic ? "opacity-70" : "opacity-100",
  ].join(" ");

  return (
    <button type="button" onClick={onClick} className={containerClasses}>
      <div className="flex items-center gap-2">
        <div
          className={`size-3 rounded-full ${COLOR_CLASSES[event.color ?? "pink"] ?? "bg-pink-400"}`}
        />
        <h4 className="font-medium text-[var(--color-text-default)]">
          {event.title}
        </h4>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-xs text-[var(--color-text-muted)]">
          {event.isAllDay ? (
            "終日"
          ) : (
            <>
              {formatTime(event.startAt)}
              {event.endAt && ` - ${formatTime(event.endAt)}`}
            </>
          )}
        </p>
        <div className="flex items-center gap-1">
          {partnerColor && (
            <span
              className={`inline-block size-2 rounded-full ${partnerColor}`}
            />
          )}
          <span className="text-[10px] text-[var(--color-text-muted)]">
            by {event.createdByDisplayName}
          </span>
        </div>
      </div>
      {event.description && (
        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">
          {event.description}
        </p>
      )}
    </button>
  );
}
