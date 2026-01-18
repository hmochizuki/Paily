"use client";

import { useState, useEffect } from "react";
import type { Sheet } from "@prisma/client";
import { updateSheetAction } from "@/server/services/noteService";
import { useRouter } from "next/navigation";

type Props = {
  sheet: Sheet;
};

export function SheetEditor({ sheet }: Props) {
  const [title, setTitle] = useState(sheet.title);
  const [content, setContent] = useState(sheet.content);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTitle(sheet.title);
    setContent(sheet.content);
  }, [sheet]);

  const handleSave = async () => {
    setIsSaving(true);

    const formData = new FormData();
    formData.append("sheetId", sheet.id);
    formData.append("title", title);
    formData.append("content", content);

    try {
      const result = await updateSheetAction(formData);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save sheet:", error);
      alert("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = title !== sheet.title || content !== sheet.content;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-default)]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-base font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] rounded px-2 py-1 -ml-2"
          placeholder="シートのタイトル"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--color-brand)] text-[var(--color-brand-contrast)] hover:bg-[var(--color-brand-hover)]"
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>

      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full resize-none focus:outline-none text-sm leading-relaxed"
          placeholder="ここに内容を入力..."
        />
      </div>
    </div>
  );
}