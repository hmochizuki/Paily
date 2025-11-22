"use client";

import { useState } from "react";
import type { ShoppingListItemViewModel } from "../types";
import { ShoppingListItemRow } from "./ShoppingListItemRow";

interface CompletedItemsSectionProps {
  items: ShoppingListItemViewModel[];
  onToggle: (itemId: string) => Promise<void> | void;
  onDelete: (itemId: string) => Promise<void> | void;
}

export function CompletedItemsSection({
  items,
  onToggle,
  onDelete,
}: CompletedItemsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`size-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
        完了済み ({items.length})
      </button>
      {isExpanded && (
        <div className="space-y-1">
          {items.map((item) => (
            <ShoppingListItemRow
              key={item.id}
              item={item}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
