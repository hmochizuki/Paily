"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateDisplayNameAction } from "../actions/updateProfile";

interface EditDisplayNameFormProps {
  currentName: string;
}

export function EditDisplayNameForm({ currentName }: EditDisplayNameFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateDisplayNameAction(formData);
      router.refresh();
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setName(currentName);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form action={handleSubmit} className="space-y-2">
        <input
          name="displayName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-base focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
          maxLength={50}
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending || name.trim() === ""}
            className="rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
          >
            {isPending ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-subtle)]"
          >
            キャンセル
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-base text-[var(--color-text-default)]">
        {currentName}
      </span>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded px-2 py-1 text-sm text-[var(--color-brand)] transition-colors hover:bg-[var(--color-bg-subtle)]"
      >
        編集
      </button>
    </div>
  );
}
