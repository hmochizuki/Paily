"use client";

import { useState } from "react";
import { deleteItemAction } from "../actions/deleteItem";
import { toggleItemCheckAction } from "../actions/toggleItemCheck";

interface ShoppingListItemRowProps {
  item: {
    id: string;
    name: string;
    note: string | null;
    quantity: string | null;
    createdAt: Date;
    addedBy: {
      displayName: string;
    };
    state: {
      isChecked: boolean;
      checkedAt: Date | null;
    } | null;
  };
}

export function ShoppingListItemRow({ item }: ShoppingListItemRowProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleItemCheckAction(item.id);
    } catch {
      // エラー処理
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItemAction(item.id);
    } catch {
      setIsDeleting(false);
    }
  };

  const isChecked = item.state?.isChecked ?? false;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-default)] bg-white p-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isToggling}
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
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          {isChecked && item.state?.checkedAt
            ? `完了: ${item.state.checkedAt.toLocaleDateString("ja-JP")}`
            : `追加: ${item.createdAt.toLocaleDateString("ja-JP")}`}
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
        disabled={isDeleting}
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
