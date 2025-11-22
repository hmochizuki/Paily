"use client";

import { useTransition } from "react";
import { createEventAction } from "../actions/createEvent";

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

export function EventFormModal({
  coupleId,
  initialDate,
  onClose,
  onSubmit,
}: EventFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const submitHandler = onSubmit ?? createEventAction;

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
          <input type="hidden" name="isAllDay" value="false" />
          <input type="hidden" name="color" value="pink" />

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
                defaultValue={formatDateForInput(initialDate)}
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                required
              />
            </div>
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
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              />
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
