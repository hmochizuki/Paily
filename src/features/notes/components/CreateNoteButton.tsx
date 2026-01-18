"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNoteAction } from "@/server/services/noteService";

export function CreateNoteButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createNoteAction(formData);
      if (result.success) {
        setShowDialog(false);
        router.push(`/notes/${result.noteId}`);
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("ノートの作成に失敗しました");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[var(--color-brand)] text-[var(--color-brand-contrast)] shadow-lg transition-all hover:bg-[var(--color-brand-hover)] hover:scale-110 z-[var(--z-index-popover)] flex items-center justify-center"
        aria-label="新しいノートを作成"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-[var(--z-index-modal-backdrop)] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md z-[var(--z-index-modal)]">
            <h2 className="text-lg font-semibold mb-4">新しいノートを作成</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                  placeholder="ノートのタイトルを入力"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  disabled={isCreating}
                  className="flex-1 rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-background-muted)] disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
                >
                  {isCreating ? "作成中..." : "作成"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}