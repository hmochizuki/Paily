"use client";

import { useRef, useState, useTransition } from "react";
import { addItemAction } from "@/server/handlers/shoppingListHandler";

type AddItemSubmitHandler = (formData: FormData) => Promise<void>;

interface AddItemFormProps {
  listId: string;
  coupleId: string;
  onSubmit?: AddItemSubmitHandler;
}

export function AddItemForm({ listId, coupleId, onSubmit }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submitHandler = onSubmit ?? addItemAction;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await submitHandler(formData);
      setName("");
      setLabel("");
      formRef.current?.reset();
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="coupleId" value={coupleId} />
      <input
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="アイテムを追加..."
        className="w-full rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
        disabled={isPending}
      />
      <div className="flex gap-2">
        <input
          name="label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="ラベル (任意)"
          maxLength={10}
          className="flex-1 rounded-lg border border-[var(--color-border-default)] px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || name.trim() === ""}
          className="shrink-0 rounded-lg bg-[var(--color-brand)] px-6 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
        >
          {isPending ? "追加中..." : "追加"}
        </button>
      </div>
    </form>
  );
}
