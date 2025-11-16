"use client";

import { useTransition } from "react";
import { deleteEventAction } from "../actions/deleteEvent";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
    isAllDay: boolean;
    color: string | null;
    createdBy: {
      displayName: string;
    };
  };
}

const COLOR_CLASSES: Record<string, string> = {
  pink: "bg-pink-400",
  red: "bg-red-400",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
};

export function EventCard({ event }: EventCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("このイベントを削除しますか？")) {
      startTransition(async () => {
        await deleteEventAction(event.id);
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`size-3 rounded-full ${COLOR_CLASSES[event.color ?? "pink"] ?? "bg-pink-400"}`}
            />
            <h4 className="font-medium text-[var(--color-text-default)]">
              {event.title}
            </h4>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {event.isAllDay ? (
              "終日"
            ) : (
              <>
                {formatTime(new Date(event.startAt))}
                {event.endAt && ` - ${formatTime(new Date(event.endAt))}`}
              </>
            )}
          </p>
          {event.description && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {event.description}
            </p>
          )}
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            作成: {event.createdBy.displayName}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-danger)] disabled:opacity-50"
          aria-label="削除"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
