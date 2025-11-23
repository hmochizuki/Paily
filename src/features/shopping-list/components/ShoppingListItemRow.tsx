"use client";

import { useTransition } from "react";
import type { ShoppingListItemViewModel } from "../types";

interface ShoppingListItemRowProps {
  item: ShoppingListItemViewModel;
  onToggle: (itemId: string) => Promise<void> | void;
  onDelete: (itemId: string) => Promise<void> | void;
}

export function ShoppingListItemRow({
  item,
  onToggle,
  onDelete,
}: ShoppingListItemRowProps) {
  const [isTogglingPending, startToggleTransition] = useTransition();
  const [isDeletingPending, startDeleteTransition] = useTransition();

  const handleToggle = () => {
    startToggleTransition(async () => {
      await onToggle(item.id);
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await onDelete(item.id);
    });
  };

  const isChecked = item.state?.isChecked ?? false;
  const containerClasses = [
    "flex items-center gap-3 rounded-lg border border-[var(--color-border-default)] bg-white p-3 transition-opacity",
    item.isOptimistic ? "opacity-70" : "opacity-100",
  ].join(" ");

  return (
    <div className={containerClasses}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isTogglingPending || isDeletingPending}
        className="flex size-6 shrink-0 items-center justify-center rounded border border-[var(--color-border-default)] transition-colors hover:bg-[var(--color-bg-subtle)] disabled:opacity-50"
        aria-label={isChecked ? "未完了にする" : "完了にする"}
      >
        {isChecked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4 text-[var(--color-success)]"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <div className="flex flex-wrap justify-between gap-2">
          <p
            className={`text-sm ${isChecked ? "text-[var(--color-text-muted)] line-through" : "text-[var(--color-text-default)]"}`}
          >
            {item.name}
            {item.quantity && (
              <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                ({item.quantity})
              </span>
            )}
          </p>
          {item.label && (
            <span className="inline-flex items-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand)] px-2 py-0 text-xs font-semibold text-[var(--color-brand-contrast)] shadow-sm">
              {item.label}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          {isChecked && item.state?.checkedAt
            ? `完了: ${item.state.checkedAt.toLocaleDateString("ja-JP")}`
            : `追加: ${item.createdAt?.toLocaleDateString("ja-JP") ?? "不明"}`}
        </p>
        {item.note && (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {item.note}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeletingPending || isTogglingPending}
        className="rounded p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-danger)] disabled:opacity-50"
        aria-label="削除"
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
  );
}
