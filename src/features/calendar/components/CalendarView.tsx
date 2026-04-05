"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { CalendarEventViewModel } from "../types";
import { formatDateKey, isEventOnDate } from "../utils/dateUtils";

type ViewMode = "month" | "week";

type PartnerColorMap = Map<string, string>;

type CalendarViewProps = {
  events: CalendarEventViewModel[];
  coupleId: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

const PARTNER_COLORS = ["bg-blue-500", "bg-pink-500"];

function derivePartnerColors(
  events: CalendarEventViewModel[],
): PartnerColorMap {
  const names = new Set<string>();
  for (const event of events) {
    names.add(event.createdByDisplayName);
  }
  const colorMap: PartnerColorMap = new Map();
  let index = 0;
  for (const name of names) {
    colorMap.set(name, PARTNER_COLORS[index % PARTNER_COLORS.length]);
    index++;
  }
  return colorMap;
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

function getWeekDays(baseDate: Date): Date[] {
  const days: Date[] = [];
  const dayOfWeek = baseDate.getDay();
  const sunday = new Date(baseDate);
  sunday.setDate(baseDate.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    days.push(date);
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

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CalendarView({
  events,
  coupleId,
  viewMode,
  onViewModeChange,
}: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const partnerColors = useMemo(() => derivePartnerColors(events), [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const openDayDetail = (date: Date) => {
    const dateKey = formatDateKey(date);
    const params = new URLSearchParams({ spaceId: coupleId });
    router.push(`/calendar/days/${dateKey}?${params.toString()}`);
  };

  const openEventDetail = (eventId: string, date: Date) => {
    const dateKey = formatDateKey(date);
    const returnTo = encodeURIComponent("/calendar");
    router.push(
      `/calendar/days/${dateKey}/events/${eventId}?returnTo=${returnTo}`,
    );
  };

  const handleDateClick = (date: Date) => {
    if (selectedDate && isSameDay(selectedDate, date)) {
      openDayDetail(date);
    } else {
      setSelectedDate(date);
    }
  };

  const goToPrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    }
  };

  const goToNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const headerLabel =
    viewMode === "month"
      ? `${year}年${month + 1}月`
      : (() => {
          const weekDays = getWeekDays(currentDate);
          const startDate = weekDays[0];
          const endDate = weekDays[6];
          if (startDate.getMonth() === endDate.getMonth()) {
            return `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日〜${endDate.getDate()}日`;
          }
          return `${startDate.getMonth() + 1}/${startDate.getDate()}〜${endDate.getMonth() + 1}/${endDate.getDate()}`;
        })();

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      {/* View mode toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-[var(--color-border-default)] bg-white">
          <button
            type="button"
            onClick={() => onViewModeChange("month")}
            className={`rounded-l-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "month"
                ? "bg-[var(--color-brand)] text-[var(--color-brand-contrast)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
            }`}
          >
            月
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("week")}
            className={`rounded-r-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "week"
                ? "bg-[var(--color-brand)] text-[var(--color-brand-contrast)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
            }`}
          >
            週
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevious}
          className="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-default)]"
          aria-label={viewMode === "month" ? "前月" : "前週"}
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
            {headerLabel}
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
          onClick={goToNext}
          className="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-default)]"
          aria-label={viewMode === "month" ? "翌月" : "翌週"}
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

      {viewMode === "month" ? (
        <MonthView
          events={events}
          days={getDaysInMonth(year, month)}
          month={month}
          today={today}
          selectedDate={selectedDate}
          partnerColors={partnerColors}
          onDateClick={handleDateClick}
        />
      ) : (
        <WeekView
          events={events}
          currentDate={currentDate}
          today={today}
          partnerColors={partnerColors}
          onDayClick={openDayDetail}
          onEventClick={openEventDetail}
        />
      )}
    </div>
  );
}

type MonthViewProps = {
  events: CalendarEventViewModel[];
  days: Date[];
  month: number;
  today: Date;
  selectedDate: Date | null;
  partnerColors: PartnerColorMap;
  onDateClick: (date: Date) => void;
};

function MonthView({
  events,
  days,
  month,
  today,
  selectedDate,
  partnerColors,
  onDateClick,
}: MonthViewProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border-default)] bg-white">
      <div className="grid grid-cols-7 border-b border-[var(--color-border-default)]">
        {DAY_LABELS.map((day, index) => (
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
              onClick={() => onDateClick(date)}
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
                      className={`flex items-center gap-0.5 truncate rounded px-1 text-[10px] text-white ${COLOR_CLASSES[event.color ?? "pink"] ?? "bg-pink-400"}`}
                    >
                      <span
                        className={`inline-block size-1.5 shrink-0 rounded-full ${partnerColors.get(event.createdByDisplayName) ?? "bg-gray-400"}`}
                      />
                      <span className="truncate">{event.title}</span>
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
  );
}

type WeekViewProps = {
  events: CalendarEventViewModel[];
  currentDate: Date;
  today: Date;
  partnerColors: PartnerColorMap;
  onDayClick: (date: Date) => void;
  onEventClick: (eventId: string, date: Date) => void;
};

function WeekView({
  events,
  currentDate,
  today,
  partnerColors,
  onDayClick,
  onEventClick,
}: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="grid grid-cols-7 gap-1 rounded-lg border border-[var(--color-border-default)] bg-white p-2">
      {weekDays.map((date) => {
        const isToday = isSameDay(date, today);
        const dayOfWeek = date.getDay();
        const dayEvents = events.filter((event) => isEventOnDate(event, date));
        const dateKey = formatDateKey(date);

        return (
          <div key={dateKey} className="flex min-h-[200px] flex-col">
            {/* Day header */}
            <button
              type="button"
              onClick={() => onDayClick(date)}
              className="mb-2 flex flex-col items-center rounded-lg py-1 transition-colors hover:bg-[var(--color-bg-subtle)]"
            >
              <span
                className={`text-[10px] font-medium ${
                  dayOfWeek === 0
                    ? "text-red-500"
                    : dayOfWeek === 6
                      ? "text-blue-500"
                      : "text-[var(--color-text-muted)]"
                }`}
              >
                {DAY_LABELS[dayOfWeek]}
              </span>
              <span
                className={`mt-0.5 inline-flex size-7 items-center justify-center rounded-full text-sm ${
                  isToday
                    ? "bg-[var(--color-brand)] font-semibold text-[var(--color-brand-contrast)]"
                    : dayOfWeek === 0
                      ? "text-red-500"
                      : dayOfWeek === 6
                        ? "text-blue-500"
                        : "text-[var(--color-text-default)]"
                }`}
              >
                {date.getDate()}
              </span>
            </button>

            {/* Events */}
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {dayEvents.map((event) => {
                const colorClass =
                  partnerColors.get(event.createdByDisplayName) ??
                  "bg-gray-400";
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventClick(event.id, date)}
                    className={`rounded p-1 text-left transition-colors hover:bg-[var(--color-bg-subtle)] ${
                      event.isOptimistic ? "opacity-70" : ""
                    }`}
                  >
                    <div
                      className={`rounded px-1.5 py-0.5 text-[10px] text-white ${COLOR_CLASSES[event.color ?? "pink"] ?? "bg-pink-400"}`}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                      <div className="text-white/80">
                        {event.isAllDay ? "終日" : formatTime(event.startAt)}
                      </div>
                    </div>
                    <div className="mt-0.5 flex items-center gap-0.5 px-0.5">
                      <span
                        className={`inline-block size-2 shrink-0 rounded-full ${colorClass}`}
                      />
                      <span className="truncate text-[9px] text-[var(--color-text-muted)]">
                        {event.createdByDisplayName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
