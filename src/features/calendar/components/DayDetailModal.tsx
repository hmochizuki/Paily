"use client";

import { useEffect, useState } from "react";
import { NativeModal } from "@/common/ui/NativeModal";
import type { CalendarEventViewModel } from "../types";
import { EventCard } from "./EventCard";

interface DayDetailModalProps {
  date: Date;
  events: CalendarEventViewModel[];
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: () => void;
  onEditEvent: (eventId: string) => void;
}

function formatDisplayDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function DayDetailModal({
  date,
  events,
  isOpen,
  onClose,
  onAddEvent,
  onEditEvent,
}: DayDetailModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedEventId) {
      return;
    }
    const exists = events.some((event) => event.id === selectedEventId);
    if (!exists) {
      setSelectedEventId(null);
    }
  }, [events, selectedEventId]);

  const handleClose = () => {
    setSelectedEventId(null);
    onClose();
  };

  return (
    <NativeModal isOpen={isOpen} contentClassName="max-h-full overflow-y-auto">
      <div className="-mx-4 -mt-4 mb-4 flex items-center justify-between bg-[var(--color-brand)] px-4 py-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-default)]">
            {formatDisplayDate(date)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
            aria-label="閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="size-5"
              aria-hidden="true"
            >
              <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
          この日の予定はありません。プラスボタンから追加できます。
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onEditEvent(event.id)}
            />
          ))}
        </div>
      )}
      {
        <div className="absolute bottom-8 right-4">
          <button
            type="button"
            onClick={onAddEvent}
            className="z-[var(--z-index-popover)] flex size-14 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-brand-contrast)] shadow-lg transition-colors hover:bg-[var(--color-brand-hover)]"
            aria-label="新規作成"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>
      }
    </NativeModal>
  );
}
