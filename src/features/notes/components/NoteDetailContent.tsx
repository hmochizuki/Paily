"use client";

import { useState } from "react";
import type { Note, Sheet } from "@prisma/client";
import { SheetEditor } from "./SheetEditor";
import { createSheetAction } from "@/server/services/noteService";
import { useRouter } from "next/navigation";

type NoteWithSheets = Note & {
  sheets: Sheet[];
};

type Props = {
  note: NoteWithSheets;
};

export function NoteDetailContent({ note }: Props) {
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const router = useRouter();

  const handleCreateSheet = async () => {
    setIsCreatingSheet(true);

    const formData = new FormData();
    formData.append("noteId", note.id);
    formData.append("title", `シート${note.sheets.length + 1}`);

    try {
      const result = await createSheetAction(formData);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create sheet:", error);
      alert("シートの作成に失敗しました");
    } finally {
      setIsCreatingSheet(false);
    }
  };

  if (selectedSheet) {
    return (
      <div>
        <div className="px-4 py-3 border-b border-[var(--color-border-default)] bg-white">
          <button
            onClick={() => setSelectedSheet(null)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-default)] flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span className="text-sm">シート一覧に戻る</span>
          </button>
        </div>
        <SheetEditor sheet={selectedSheet} />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {note.sheets.map((sheet) => (
          <button
            key={sheet.id}
            onClick={() => setSelectedSheet(sheet)}
            className="p-4 bg-white rounded-lg border border-[var(--color-border-default)] hover:border-[var(--color-brand)] hover:shadow-md transition-all text-left group"
          >
            <h3 className="font-medium text-[var(--color-text-default)] mb-2 group-hover:text-[var(--color-brand)]">
              {sheet.title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] line-clamp-3">
              {sheet.content || "内容がありません"}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>{new Date(sheet.updatedAt).toLocaleDateString('ja-JP')}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)]"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        ))}

        <button
          onClick={handleCreateSheet}
          disabled={isCreatingSheet}
          className="p-4 bg-white rounded-lg border-2 border-dashed border-[var(--color-border-default)] hover:border-[var(--color-brand)] transition-all flex flex-col items-center justify-center min-h-[120px] group disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)] mb-2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)]">
            {isCreatingSheet ? "作成中..." : "新しいシートを追加"}
          </span>
        </button>
      </div>
    </div>
  );
}