"use client";

import { useState, useTransition } from "react";
import { createEventAction } from "../actions/createEvent";

interface CreateEventButtonProps {
  coupleId: string;
}

const EVENT_COLORS = [
  { value: "pink", label: "ピンク", class: "bg-pink-400" },
  { value: "red", label: "レッド", class: "bg-red-400" },
  { value: "orange", label: "オレンジ", class: "bg-orange-400" },
  { value: "yellow", label: "イエロー", class: "bg-yellow-400" },
  { value: "green", label: "グリーン", class: "bg-green-400" },
  { value: "blue", label: "ブルー", class: "bg-blue-400" },
  { value: "purple", label: "パープル", class: "bg-purple-400" },
];

export function CreateEventButton({ coupleId }: CreateEventButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState("pink");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setIsAllDay(false);
    setColor("pink");
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createEventAction(formData);
      setIsOpen(false);
      resetForm();
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[var(--z-index-popover)] flex size-14 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-brand-contrast)] shadow-lg transition-colors hover:bg-[var(--color-brand-hover)]"
        aria-label="イベント追加"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="size-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[var(--z-index-modal-backdrop)] flex items-center justify-center bg-black/50">
      <div className="z-[var(--z-index-modal)] max-h-[90vh] w-[90%] max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-default)]">
          新しいイベント
        </h2>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="coupleId" value={coupleId} />
          <input type="hidden" name="isAllDay" value={isAllDay.toString()} />
          <input type="hidden" name="color" value={color} />

          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
            >
              タイトル
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: デート"
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
            >
              メモ
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳細を入力..."
              rows={3}
              className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isAllDay"
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="size-4 rounded border-[var(--color-border-default)]"
            />
            <label
              htmlFor="isAllDay"
              className="text-sm text-[var(--color-text-default)]"
            >
              終日
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
              >
                開始日
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                required
              />
            </div>
            {!isAllDay && (
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
                >
                  開始時間
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="endDate"
                className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
              >
                終了日
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
              />
            </div>
            {!isAllDay && (
              <div>
                <label
                  htmlFor="endTime"
                  className="mb-1 block text-sm font-medium text-[var(--color-text-default)]"
                >
                  終了時間
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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
                  onClick={() => setColor(c.value)}
                  className={`size-8 rounded-full ${c.class} ${color === c.value ? "ring-2 ring-[var(--color-text-default)] ring-offset-2" : ""}`}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-subtle)]"
              disabled={isPending}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
              disabled={isPending || title.trim() === "" || startDate === ""}
            >
              {isPending ? "作成中..." : "作成"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
