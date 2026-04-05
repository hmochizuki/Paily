"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from "react";
import {
  getCategoryLabel,
  SHOPPING_CATEGORIES,
} from "@/features/shopping-list/constants";
import {
  addItemAction,
  deleteItemAction,
  toggleItemCheckAction,
} from "@/server/handlers/shoppingListHandler";
import {
  type ShoppingListItemDto,
  type ShoppingListItemViewModel,
  toShoppingListItemViewModels,
} from "../types";
import { AddItemForm } from "./AddItemForm";
import { CompletedItemsSection } from "./CompletedItemsSection";
import { ShoppingListItemRow } from "./ShoppingListItemRow";

type OptimisticAction =
  | { type: "replace"; items: ShoppingListItemViewModel[] }
  | { type: "add"; item: ShoppingListItemViewModel }
  | { type: "toggle"; itemId: string }
  | { type: "delete"; itemId: string };

const optimisticReducer = (
  items: ShoppingListItemViewModel[],
  action: OptimisticAction,
): ShoppingListItemViewModel[] => {
  switch (action.type) {
    case "replace":
      return action.items;
    case "add":
      return [...items, action.item];
    case "toggle":
      return items.map((item) => {
        if (item.id !== action.itemId) {
          return item;
        }
        const nextIsChecked = !(item.state?.isChecked ?? false);
        return {
          ...item,
          state: {
            isChecked: nextIsChecked,
            checkedAt: nextIsChecked ? new Date() : null,
          },
        };
      });
    case "delete":
      return items.filter((item) => item.id !== action.itemId);
    default:
      return items;
  }
};

interface ShoppingListDetailClientProps {
  listId: string;
  coupleId: string;
  initialItemsDto: ShoppingListItemDto[];
  currentUserDisplayName: string;
  recentLabels: string[];
}

export function ShoppingListDetailClient({
  listId,
  coupleId,
  initialItemsDto,
  currentUserDisplayName,
  recentLabels,
}: ShoppingListDetailClientProps) {
  const initialViewModels = useMemo(
    () => toShoppingListItemViewModels(initialItemsDto),
    [initialItemsDto],
  );
  const router = useRouter();
  const [optimisticItems, dispatchOptimistic] = useOptimistic<
    ShoppingListItemViewModel[],
    OptimisticAction
  >(initialViewModels, optimisticReducer);
  const serverSnapshotRef = useRef(initialViewModels);
  const [labelSuggestions, setLabelSuggestions] = useState(recentLabels);
  const [groupByCategory, setGroupByCategory] = useState(false);

  useEffect(() => {
    serverSnapshotRef.current = initialViewModels;
    startTransition(() => {
      dispatchOptimistic({ type: "replace", items: initialViewModels });
    });
  }, [initialViewModels, dispatchOptimistic]);

  const refreshAfterMutation = () => {
    router.refresh();
  };

  const revertToServerSnapshot = () => {
    dispatchOptimistic({ type: "replace", items: serverSnapshotRef.current });
  };

  const createOptimisticItem = (params: {
    name: string;
    label: string | null;
    category: string | null;
  }): ShoppingListItemViewModel => ({
    id: `temp-${crypto.randomUUID()}`,
    name: params.name,
    label: params.label,
    category: params.category,
    note: null,
    quantity: null,
    createdAt: new Date(),
    addedBy: {
      displayName: currentUserDisplayName,
    },
    state: {
      isChecked: false,
      checkedAt: null,
    },
    isOptimistic: true,
  });

  const handleAddItem = async (formData: FormData) => {
    const name = formData.get("name");
    const rawLabel = formData.get("label");
    const rawCategory = formData.get("category");
    if (typeof name !== "string" || name.trim() === "") {
      return;
    }

    const label =
      typeof rawLabel === "string" && rawLabel.trim() !== ""
        ? rawLabel.trim()
        : null;

    if (label && label.length > 10) {
      return;
    }

    const category =
      typeof rawCategory === "string" && rawCategory.trim() !== ""
        ? rawCategory.trim()
        : null;

    const optimisticItem = createOptimisticItem({
      name: name.trim(),
      label,
      category,
    });
    dispatchOptimistic({ type: "add", item: optimisticItem });

    try {
      await addItemAction(formData);
      if (label) {
        setLabelSuggestions((prev) => {
          if (prev.includes(label)) {
            return prev;
          }
          const next = [label, ...prev];
          return next.slice(0, 30);
        });
      }
      refreshAfterMutation();
    } catch (error) {
      console.error("アイテムの追加に失敗しました", error);
      revertToServerSnapshot();
    }
  };

  const handleToggleItem = async (itemId: string) => {
    dispatchOptimistic({ type: "toggle", itemId });

    try {
      await toggleItemCheckAction(itemId);
      refreshAfterMutation();
    } catch (error) {
      console.error("アイテムのチェック切り替えに失敗しました", error);
      revertToServerSnapshot();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    dispatchOptimistic({ type: "delete", itemId });

    try {
      await deleteItemAction(itemId);
      refreshAfterMutation();
    } catch (error) {
      console.error("アイテムの削除に失敗しました", error);
      revertToServerSnapshot();
    }
  };

  const uncheckedItems = optimisticItems
    .filter((item) => !(item.state?.isChecked ?? false))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const checkedItems = optimisticItems
    .filter((item) => item.state?.isChecked ?? false)
    .sort((a, b) => {
      const aTime = a.state?.checkedAt
        ? new Date(a.state.checkedAt).getTime()
        : new Date(a.createdAt).getTime();
      const bTime = b.state?.checkedAt
        ? new Date(b.state.checkedAt).getTime()
        : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

  const groupedUncheckedItems = useMemo(() => {
    if (!groupByCategory) {
      return null;
    }
    const categoryOrder: string[] = SHOPPING_CATEGORIES.map((c) => c.value);
    const groups = new Map<string, ShoppingListItemViewModel[]>();

    for (const item of uncheckedItems) {
      const key = item.category ?? "__uncategorized__";
      const existing = groups.get(key);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    const sorted = [...groups.entries()].sort(([a], [b]) => {
      const aIdx =
        a === "__uncategorized__"
          ? categoryOrder.length
          : categoryOrder.indexOf(a);
      const bIdx =
        b === "__uncategorized__"
          ? categoryOrder.length
          : categoryOrder.indexOf(b);
      return (
        (aIdx === -1 ? categoryOrder.length : aIdx) -
        (bIdx === -1 ? categoryOrder.length : bIdx)
      );
    });

    return sorted.map(([key, items]) => ({
      key,
      label: key === "__uncategorized__" ? "未分類" : getCategoryLabel(key),
      items,
    }));
  }, [groupByCategory, uncheckedItems]);

  return (
    <>
      <AddItemForm
        listId={listId}
        coupleId={coupleId}
        labelSuggestions={labelSuggestions}
        onSubmit={handleAddItem}
      />

      {optimisticItems.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-center text-sm text-[var(--color-text-muted)]">
          アイテムがありません。上のフォームから追加してください。
        </div>
      ) : (
        <div className="space-y-4">
          {uncheckedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-[var(--color-text-muted)]">
                  未完了 ({uncheckedItems.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setGroupByCategory((prev) => !prev)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    groupByCategory
                      ? "bg-[var(--color-brand)] text-[var(--color-brand-contrast)]"
                      : "border border-[var(--color-border-default)] bg-white text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
                  }`}
                >
                  カテゴリ別表示
                </button>
              </div>
              {groupByCategory && groupedUncheckedItems ? (
                <div className="space-y-3">
                  {groupedUncheckedItems.map((group) => (
                    <div key={group.key} className="space-y-1">
                      <h3 className="text-xs font-semibold text-[var(--color-text-muted)]">
                        {group.label} ({group.items.length})
                      </h3>
                      {group.items.map((item) => (
                        <ShoppingListItemRow
                          key={item.id}
                          item={item}
                          onToggle={handleToggleItem}
                          onDelete={handleDeleteItem}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {uncheckedItems.map((item) => (
                    <ShoppingListItemRow
                      key={item.id}
                      item={item}
                      onToggle={handleToggleItem}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {checkedItems.length > 0 && (
            <CompletedItemsSection
              items={checkedItems}
              onToggle={handleToggleItem}
              onDelete={handleDeleteItem}
            />
          )}
        </div>
      )}
    </>
  );
}
