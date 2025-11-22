"use client";

import { NativeModal } from "@/common/ui/NativeModal";
import type { CalendarEventViewModel } from "../types";
import { EventCard } from "./EventCard";
import {
  type EventDeleteHandler,
  EventDetailContent,
  type EventUpdateHandler,
} from "./EventDetailModal";

interface DayDetailModalProps {
  date: Date;
  events: CalendarEventViewModel[];
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: CalendarEventViewModel | null;
  onSelectEvent: (event: CalendarEventViewModel) => void;
  onBackToList: () => void;
  onAddEvent: () => void;
  onUpdateEvent: EventUpdateHandler;
  onDeleteEvent: EventDeleteHandler;
}

function formatDisplayDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function DayDetailModal({
  date,
  events,
  isOpen,
  onClose,
  selectedEvent,
  onSelectEvent,
  onBackToList,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: DayDetailModalProps) {
  return (
    <NativeModal
      isOpen={isOpen}
      onClose={onClose}
      placement="bottom"
      contentClassName="max-h-full overflow-y-auto"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-default)]">
            {formatDisplayDate(date)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!selectedEvent && (
            <button
              type="button"
              onClick={onAddEvent}
              className="rounded-full bg-[var(--color-brand)] p-2 text-[var(--color-brand-contrast)] shadow hover:bg-[var(--color-brand-hover)]"
              aria-label="予定を追加"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="size-5"
                aria-hidden="true"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
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

      {selectedEvent ? (
        <EventDetailContent
          event={selectedEvent}
          onClose={onClose}
          onBack={onBackToList}
          onUpdate={onUpdateEvent}
          onDelete={onDeleteEvent}
          className="space-y-4"
        />
      ) : events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
          この日の予定はありません。プラスボタンから追加できます。
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onSelectEvent(event)}
            />
          ))}
        </div>
      )}
    </NativeModal>
  );
}
