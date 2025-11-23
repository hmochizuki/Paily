"use client";

import { useState, useTransition } from "react";
import { createEventAction } from "../actions/createEvent";
import { EVENT_COLORS } from "../constants";

type EventFormSubmitHandler = (formData: FormData) => Promise<void>;

interface EventFormModalProps {
  coupleId: string;
  initialDate: Date;
  onClose: () => void;
  onSubmit?: EventFormSubmitHandler;
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

export function EventFormModal({
  coupleId,
  initialDate,
  onClose,
  onSubmit,
}: EventFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedColor, setSelectedColor] = useState("pink");
  const submitHandler = onSubmit ?? createEventAction;
  const formattedInitialDate = formatDateForInput(initialDate);
  const formattedInitialTime = formatTimeForInput(initialDate);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await submitHandler(formData);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[var(--z-index-modal-backdrop)] flex items-center justify-center bg-black/50">
      <div className="z-[var(--z-index-modal)] max-h-[90vh] w-[90%] max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-default)]">
          新しいイベント
        </h2>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="coupleId" value={coupleId} />
          <input type="hidden" name="isAllDay" value={isAllDay.toString()} />
          <input type="hidden" name="color" value={selectedColor} />

          <div>
            <label
              htmlFor="modal-title"
              className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
            >
              タイトル
            </label>
            <input
              id="modal-title"
              name="title"
              type="text"
              placeholder="例: デート"
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="modal-description"
              className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
            >
              メモ
            </label>
            <textarea
              id="modal-description"
              name="description"
              placeholder="詳細を入力..."
              rows={3}
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="modal-isAllDay"
              type="checkbox"
              checked={isAllDay}
              onChange={(event) => setIsAllDay(event.target.checked)}
              className="size-4 rounded border-[var(--color-border-default)]"
            />
            <label
              htmlFor="modal-isAllDay"
              className="text-sm text-[var(--color-text-default)]"
            >
              終日
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="modal-startDate"
                className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
              >
                開始日
              </label>
              <input
                id="modal-startDate"
                name="startDate"
                type="date"
                defaultValue={formattedInitialDate}
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                required
              />
            </div>
            {!isAllDay && (
              <div>
                <label
                  htmlFor="modal-startTime"
                  className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
                >
                  開始時間
                </label>
                <input
                  id="modal-startTime"
                  name="startTime"
                  type="time"
                  defaultValue={formattedInitialTime}
                  className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="modal-endDate"
                className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
              >
                終了日
              </label>
              <input
                id="modal-endDate"
                name="endDate"
                type="date"
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              />
            </div>
            {!isAllDay && (
              <div>
                <label
                  htmlFor="modal-endTime"
                  className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
                >
                  終了時間
                </label>
                <input
                  id="modal-endTime"
                  name="endTime"
                  type="time"
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
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
              {isPending ? "作成中..." : "作成"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
