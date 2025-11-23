"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CalendarEventViewModel } from "../types";
import { formatDateKey, isEventOnDate } from "../utils/dateUtils";

interface CalendarViewProps {
  events: CalendarEventViewModel[];
  coupleId: string;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const endPadding = 6 - lastDay.getDay();
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
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

export function CalendarView({ events, coupleId }: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getDaysInMonth(year, month);
  const today = new Date();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const openDayDetail = (date: Date) => {
    const dateKey = formatDateKey(date);
    const params = new URLSearchParams({ spaceId: coupleId });
    router.push(`/calendar/days/${dateKey}?${params.toString()}`);
  };

  const handleDateClick = (date: Date) => {
    if (selectedDate && isSameDay(selectedDate, date)) {
      openDayDetail(date);
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-default)]"
          aria-label="前月"
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
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--color-text-default)]">
            {year}年{month + 1}月
          </h2>
          <button
            type="button"
            onClick={goToToday}
            className="rounded border border-[var(--color-border-default)] px-2 py-1 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
          >
            今日
          </button>
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-default)]"
          aria-label="翌月"
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
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      <div className="rounded-lg border border-[var(--color-border-default)] bg-white">
        <div className="grid grid-cols-7 border-b border-[var(--color-border-default)]">
          {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
            <div
              key={day}
              className={`py-2 text-center text-xs font-medium ${
                index === 0
                  ? "text-red-500"
                  : index === 6
                    ? "text-blue-500"
                    : "text-[var(--color-text-muted)]"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month;
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate
              ? isSameDay(date, selectedDate)
              : false;
            const dayEvents = events.filter((event) =>
              isEventOnDate(event, date),
            );
            const dayOfWeek = date.getDay();
            const dateKey = formatDateKey(date);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleDateClick(date)}
                className={`relative min-h-[60px] border-b border-r border-[var(--color-border-default)] p-1 text-left transition-colors hover:bg-[var(--color-bg-subtle)] ${
                  index % 7 === 6 ? "border-r-0" : ""
                } ${index >= days.length - 7 ? "border-b-0" : ""} ${isSelected ? "bg-pink-50 ring-2 ring-inset ring-[var(--color-brand)]" : ""}`}
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                    isToday
                      ? "bg-[var(--color-brand)] font-semibold text-[var(--color-brand-contrast)]"
                      : isCurrentMonth
                        ? dayOfWeek === 0
                          ? "text-red-500"
                          : dayOfWeek === 6
                            ? "text-blue-500"
                            : "text-[var(--color-text-default)]"
                        : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`truncate rounded px-1 text-[10px] text-white ${COLOR_CLASSES[event.color ?? "pink"] ?? "bg-pink-400"}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-[var(--color-text-muted)]">
                        +{dayEvents.length - 2}件
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
