"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createEventAction } from "@/server/handlers/calendarHandler";
import { EVENT_COLORS } from "../constants";
import { formatDateForInput, formatTimeForInput } from "../utils/dateUtils";

interface EventCreateFormProps {
  coupleId: string;
  initialDateIso: string;
  returnTo: string;
}

export function EventCreateForm({
  coupleId,
  initialDateIso,
  returnTo,
}: EventCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedColor, setSelectedColor] = useState("pink");
  const initialDate = useMemo(() => new Date(initialDateIso), [initialDateIso]);
  const defaultDate = formatDateForInput(initialDate);
  const defaultTime = formatTimeForInput(initialDate);
  const returnTarget = returnTo || "/calendar";

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createEventAction(formData);
      router.push(returnTarget);
    });
  };

  const handleBack = () => {
    router.push(returnTarget);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
          aria-label="戻る"
          disabled={isPending}
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
          イベントを作成
        </h1>
        <div className="size-9" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-10 pt-4">
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="coupleId" value={coupleId} />
          <input type="hidden" name="isAllDay" value={isAllDay.toString()} />
          <input type="hidden" name="color" value={selectedColor} />

          <div>
            <label
              htmlFor="create-title"
              className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
            >
              タイトル
            </label>
            <input
              id="create-title"
              name="title"
              type="text"
              placeholder="例: デート"
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="create-description"
              className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
            >
              メモ
            </label>
            <textarea
              id="create-description"
              name="description"
              placeholder="詳細を入力..."
              rows={3}
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="create-isAllDay"
              type="checkbox"
              checked={isAllDay}
              onChange={(event) => setIsAllDay(event.target.checked)}
              className="size-4 rounded border-[var(--color-border-default)]"
            />
            <label
              htmlFor="create-isAllDay"
              className="text-sm text-[var(--color-text-default)]"
            >
              終日
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="create-startDate"
                className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
              >
                開始日
              </label>
              <input
                id="create-startDate"
                name="startDate"
                type="date"
                defaultValue={defaultDate}
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                required
              />
            </div>
            {!isAllDay && (
              <div>
                <label
                  htmlFor="create-startTime"
                  className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
                >
                  開始時間
                </label>
                <input
                  id="create-startTime"
                  name="startTime"
                  type="time"
                  defaultValue={defaultTime}
                  className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="create-endDate"
                className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
              >
                終了日
              </label>
              <input
                id="create-endDate"
                name="endDate"
                type="date"
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              />
            </div>
            {!isAllDay && (
              <div>
                <label
                  htmlFor="create-endTime"
                  className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
                >
                  終了時間
                </label>
                <input
                  id="create-endTime"
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
              onClick={handleBack}
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
      </main>
    </div>
  );
}
