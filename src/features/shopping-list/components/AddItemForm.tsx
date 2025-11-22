"use client";

import { useRef, useState, useTransition } from "react";
import { addItemAction } from "../actions/addItem";

type AddItemSubmitHandler = (formData: FormData) => Promise<void>;

interface AddItemFormProps {
  listId: string;
  coupleId: string;
  onSubmit?: AddItemSubmitHandler;
}

export function AddItemForm({ listId, coupleId, onSubmit }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submitHandler = onSubmit ?? addItemAction;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await submitHandler(formData);
      setName("");
      formRef.current?.reset();
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2">
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="coupleId" value={coupleId} />
      <input
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="アイテムを追加..."
        className="flex-1 rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || name.trim() === ""}
        className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
      >
        {isPending ? "追加中..." : "追加"}
      </button>
    </form>
  );
}
