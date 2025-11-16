"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteEventAction } from "../actions/deleteEvent";

interface EventDetailModalProps {
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
  onClose: () => void;
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

function formatDateTime(dateString: string, isAllDay: boolean): string {
  const date = new Date(dateString);
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

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("このイベントを削除しますか？")) {
      startTransition(async () => {
        await deleteEventAction(event.id);
        router.refresh();
        onClose();
      });
    }
  };

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
