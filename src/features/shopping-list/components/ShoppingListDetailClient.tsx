"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
} from "react";
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
}

export function ShoppingListDetailClient({
  listId,
  coupleId,
  initialItemsDto,
  currentUserDisplayName,
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
  }): ShoppingListItemViewModel => ({
    id: `temp-${crypto.randomUUID()}`,
    name: params.name,
    label: params.label,
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

    const optimisticItem = createOptimisticItem({
      name: name.trim(),
      label,
    });
    dispatchOptimistic({ type: "add", item: optimisticItem });

    try {
      await addItemAction(formData);
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

  return (
    <>
      <AddItemForm
        listId={listId}
        coupleId={coupleId}
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
              <h2 className="text-sm font-medium text-[var(--color-text-muted)]">
                未完了 ({uncheckedItems.length})
              </h2>
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
