"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteEventAction } from "../actions/deleteEvent";
import { updateEventAction } from "../actions/updateEvent";
import type { CalendarEventViewModel } from "../types";

type EventUpdateHandler = (formData: FormData) => Promise<void>;
type EventDeleteHandler = (eventId: string) => Promise<void>;

interface EventDetailModalProps {
  event: CalendarEventViewModel;
  onClose: () => void;
  onUpdate?: EventUpdateHandler;
  onDelete?: EventDeleteHandler;
}

const COLOR_LABELS: Record<string, string> = {
  pink: "ピンク",
  red: "レッド",
  orange: "オレンジ",
  yellow: "イエロー",
  green: "グリーン",
  blue: "ブルー",
  purple: "パープル",
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

const EVENT_COLORS = [
  { value: "pink", label: "ピンク", class: "bg-pink-400" },
  { value: "red", label: "レッド", class: "bg-red-400" },
  { value: "orange", label: "オレンジ", class: "bg-orange-400" },
  { value: "yellow", label: "イエロー", class: "bg-yellow-400" },
  { value: "green", label: "グリーン", class: "bg-green-400" },
  { value: "blue", label: "ブルー", class: "bg-blue-400" },
  { value: "purple", label: "パープル", class: "bg-purple-400" },
];

function formatDateTime(date: Date, isAllDay: boolean): string {
  const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

  if (isAllDay) {
    return dateStr;
  }

  const timeStr = date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateStr} ${timeStr}`;
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

export function EventDetailModal({
  event,
  onClose,
  onUpdate,
  onDelete,
}: EventDetailModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
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

  const handleDelete = () => {
    if (confirm("このイベントを削除しますか？")) {
      startTransition(async () => {
        await deleteHandler(event.id);
        onClose();
      });
    }
  };

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      await updateHandler(formData);
      onClose();
    });
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[var(--z-index-modal-backdrop)] flex items-center justify-center bg-black/50">
        <div className="z-[var(--z-index-modal)] max-h-[90vh] w-[90%] max-w-md overflow-y-auto rounded-lg bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-default)]">
            イベントを編集
          </h2>
          <form action={handleUpdate} className="space-y-4">
            <input type="hidden" name="eventId" value={event.id} />
            <input
              type="hidden"
              name="isAllDay"
              value={editIsAllDay.toString()}
            />
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
                  defaultValue={
                    event.endAt ? formatDateForInput(event.endAt) : ""
                  }
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
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-subtle)]"
                disabled={isPending}
              >
                キャンセル
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
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[var(--z-index-modal-backdrop)] flex items-center justify-center bg-black/50">
      <div className="z-[var(--z-index-modal)] max-h-[90vh] w-[90%] max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`size-4 rounded-full ${COLOR_CLASSES[event.color ?? "pink"] ?? "bg-pink-400"}`}
            />
            <h2 className="text-lg font-semibold text-[var(--color-text-default)]">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-subtle)]"
            aria-label="閉じる"
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

        <div className="space-y-4">
          <div>
            <h3 className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">
              日時
            </h3>
            <p className="text-[var(--color-text-default)]">
              {event.isAllDay ? (
                <>
                  {formatDateTime(event.startAt, true)}
                  {event.endAt && ` - ${formatDateTime(event.endAt, true)}`}
                  <span className="ml-2 text-sm text-[var(--color-text-muted)]">
                    (終日)
                  </span>
                </>
              ) : (
                <>
                  {formatDateTime(event.startAt, false)}
                  {event.endAt && (
                    <>
                      <br />- {formatDateTime(event.endAt, false)}
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {event.description && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">
                メモ
              </h3>
              <p className="whitespace-pre-wrap text-[var(--color-text-default)]">
                {event.description}
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">
              カラー
            </h3>
            <p className="text-[var(--color-text-default)]">
              {COLOR_LABELS[event.color ?? "pink"] ?? "ピンク"}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">
              作成者
            </h3>
            <p className="text-[var(--color-text-default)]">
              {event.createdBy.displayName}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg border border-[var(--color-danger)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {isPending ? "削除中..." : "削除"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-subtle)]"
          >
            編集
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
