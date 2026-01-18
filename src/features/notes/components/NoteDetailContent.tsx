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
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(
    note.sheets[0] || null
  );
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

  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-[var(--color-border-default)] bg-[var(--color-background-muted)] overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[var(--color-text-default)]">
              シート一覧
            </h2>
            <button
              type="button"
              onClick={handleCreateSheet}
              disabled={isCreatingSheet}
              className="text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] disabled:opacity-50"
              title="新しいシートを追加"
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <div className="space-y-1">
            {note.sheets.map((sheet) => (
              <button
                key={sheet.id}
                type="button"
                onClick={() => setSelectedSheet(sheet)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedSheet?.id === sheet.id
                    ? "bg-white text-[var(--color-text-default)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:bg-white/50"
                }`}
              >
                {sheet.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {selectedSheet ? (
          <SheetEditor sheet={selectedSheet} />
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">
            シートを選択してください
          </div>
        )}
      </div>
    </div>
  );
}