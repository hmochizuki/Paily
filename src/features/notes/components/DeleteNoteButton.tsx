"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteNoteAction } from "@/server/services/noteService";

interface DeleteNoteButtonProps {
  noteId: string;
  noteTitle: string;
}

export function DeleteNoteButton({ noteId, noteTitle }: DeleteNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    const formData = new FormData();
    formData.append("noteId", noteId);

    try {
      const result = await deleteNoteAction(formData);
      if (result.success) {
        router.refresh();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("ノートの削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className="p-2 text-[var(--color-text-muted)] hover:text-red-600 transition-colors"
        aria-label="削除"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-index-modal-backdrop)] flex items-center justify-center bg-black/50">
          <div className="z-[var(--z-index-modal)] w-[90%] max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-default)]">
              ノートを削除
            </h2>
            <p className="mb-6 text-sm text-[var(--color-text-muted)]">
              「{noteTitle}」を削除してもよろしいですか？
              <br />
              この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-subtle)]"
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}