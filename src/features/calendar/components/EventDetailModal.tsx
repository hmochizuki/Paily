"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteEventAction } from "../actions/deleteEvent";
import { updateEventAction } from "../actions/updateEvent";
import { EVENT_COLORS } from "../constants";
import type { CalendarEventViewModel } from "../types";

export type EventUpdateHandler = (formData: FormData) => Promise<void>;
export type EventDeleteHandler = (eventId: string) => Promise<void>;

interface EventDetailModalProps {
  event: CalendarEventViewModel;
  onClose: () => void;
  onUpdate?: EventUpdateHandler;
  onDelete?: EventDeleteHandler;
}

interface EventDetailContentProps extends EventDetailModalProps {
  className?: string;
  onBack?: () => void;
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeForInput(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function EventDetailContent({
  event,
  onClose,
  onUpdate,
  onDelete,
  className = "",
  onBack,
}: EventDetailContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editColor, setEditColor] = useState(event.color ?? "pink");
  const [editIsAllDay, setEditIsAllDay] = useState(event.isAllDay);
  const updateHandler =
    onUpdate ??
    (async (formData: FormData) => {
      await updateEventAction(formData);
      router.refresh();
    });
  const deleteHandler =
    onDelete ??
    (async (eventId: string) => {
      await deleteEventAction(eventId);
      router.refresh();
    });
  const containerClassName = ["space-y-4", className].filter(Boolean).join(" ");

  const handleAfterMutation = () => {
    if (onBack) {
      onBack();
      return;
    }
    onClose();
  };

  const handleDelete = () => {
    if (confirm("このイベントを削除しますか？")) {
      startTransition(async () => {
        await deleteHandler(event.id);
        handleAfterMutation();
      });
    }
  };

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      await updateHandler(formData);
      handleAfterMutation();
    });
  };

  return (
    <div className={containerClassName}>
      <form action={handleUpdate} className="space-y-4">
        <input type="hidden" name="eventId" value={event.id} />
        <input type="hidden" name="isAllDay" value={editIsAllDay.toString()} />
        <input type="hidden" name="color" value={editColor} />

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
            checked={editIsAllDay}
            onChange={(e) => setEditIsAllDay(e.target.checked)}
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
              defaultValue={formatDateForInput(event.startAt)}
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              required
            />
          </div>
          {!editIsAllDay && (
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
                defaultValue={formatTimeForInput(event.startAt)}
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
              defaultValue={event.endAt ? formatDateForInput(event.endAt) : ""}
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>
          {!editIsAllDay && (
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
                defaultValue={
                  event.endAt ? formatTimeForInput(event.endAt) : ""
                }
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
            {EVENT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setEditColor(c.value)}
                className={`size-8 rounded-full ${c.class} ${editColor === c.value ? "ring-2 ring-[var(--color-text-default)] ring-offset-2" : ""}`}
                aria-label={c.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg border border-[var(--color-danger)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {isPending ? "削除中..." : "削除"}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
