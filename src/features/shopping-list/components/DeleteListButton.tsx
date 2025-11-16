"use client";

import { useState } from "react";
import { deleteListAction } from "../actions/deleteList";

interface DeleteListButtonProps {
  listId: string;
  listTitle: string;
}

export function DeleteListButton({ listId, listTitle }: DeleteListButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteListAction(listId);
    } catch {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsConfirming(true);
        }}
        className="rounded p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-danger)]"
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
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[var(--z-index-modal-backdrop)] flex items-center justify-center bg-black/50"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setIsConfirming(false);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="z-[var(--z-index-modal)] w-[90%] max-w-sm rounded-lg bg-white p-6">
        <h2
          id="delete-dialog-title"
          className="mb-2 text-lg font-semibold text-[var(--color-text-default)]"
        >
          リストを削除
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
          「{listTitle}」を削除しますか？この操作は取り消せません。
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className="rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-subtle)]"
            disabled={isDeleting}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-[var(--color-danger)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? "削除中..." : "削除"}
          </button>
        </div>
      </div>
    </div>
  );
}
