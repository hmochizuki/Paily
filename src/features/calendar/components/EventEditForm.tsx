"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  deleteEventAction,
  updateEventAction,
} from "@/server/handlers/calendarHandler";
import { EVENT_COLORS } from "../constants";
import { formatDateForInput, formatTimeForInput } from "../utils/dateUtils";

interface EventEditFormProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
    isAllDay: boolean;
    color: string | null;
  };
  returnTo: string;
}

export function EventEditForm({ event, returnTo }: EventEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isAllDay, setIsAllDay] = useState(event.isAllDay);
  const [selectedColor, setSelectedColor] = useState(event.color ?? "pink");
  const startAt = useMemo(() => new Date(event.startAt), [event.startAt]);
  const endAt = useMemo(
    () => (event.endAt ? new Date(event.endAt) : null),
    [event.endAt],
  );
  const returnTarget = returnTo || "/calendar";

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateEventAction(formData);
      router.push(returnTarget);
    });
  };

  const handleDelete = () => {
    if (!confirm("このイベントを削除しますか？")) {
      return;
    }
    startDeleteTransition(async () => {
      await deleteEventAction(event.id);
      router.push(returnTarget);
    });
  };

  const handleBack = () => {
    router.push(returnTarget);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3 bg-[var(--color-brand)]">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
          aria-label="戻る"
          disabled={isPending || isDeleting}
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
        <h1 className="text-base font-semibold text-[var(--color-text-default)]">
          イベントを編集
        </h1>
        <div className="size-9" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4">
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="eventId" value={event.id} />
          <input type="hidden" name="isAllDay" value={isAllDay.toString()} />
          <input type="hidden" name="color" value={selectedColor} />

          <div>
            <label
              htmlFor="edit-title"
              className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
            >
              タイトル
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              defaultValue={event.title}
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
            >
              メモ
            </label>
            <textarea
              id="edit-description"
              name="description"
              defaultValue={event.description ?? ""}
              rows={3}
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="edit-isAllDay"
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="size-4 rounded border-[var(--color-border-default)]"
            />
            <label
              htmlFor="edit-isAllDay"
              className="text-sm text-[var(--color-text-default)]"
            >
              終日
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-startDate"
                className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
              >
                開始日
              </label>
              <input
                id="edit-startDate"
                name="startDate"
                type="date"
                defaultValue={formatDateForInput(startAt)}
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                required
              />
            </div>
            {!isAllDay && (
              <div>
                <label
                  htmlFor="edit-startTime"
                  className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
                >
                  開始時間
                </label>
                <input
                  id="edit-startTime"
                  name="startTime"
                  type="time"
                  defaultValue={formatTimeForInput(startAt)}
                  className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-endDate"
                className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
              >
                終了日
              </label>
              <input
                id="edit-endDate"
                name="endDate"
                type="date"
                defaultValue={endAt ? formatDateForInput(endAt) : ""}
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              />
            </div>
            {!isAllDay && (
              <div>
                <label
                  htmlFor="edit-endTime"
                  className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
                >
                  終了時間
                </label>
                <input
                  id="edit-endTime"
                  name="endTime"
                  type="time"
                  defaultValue={endAt ? formatTimeForInput(endAt) : ""}
                  className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                />
              </div>
            )}
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-[var(--color-text-default)]">
              カラー
            </span>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setSelectedColor(colorOption.value)}
                  className={`size-8 rounded-full ${colorOption.class} ${selectedColor === colorOption.value ? "ring-2 ring-[var(--color-text-default)] ring-offset-2" : ""}`}
                  aria-label={colorOption.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 rounded-lg border border-[var(--color-danger)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] hover:bg-red-50 disabled:opacity-50"
              disabled={isPending || isDeleting}
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
              disabled={isPending || isDeleting}
            >
              {isPending ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
