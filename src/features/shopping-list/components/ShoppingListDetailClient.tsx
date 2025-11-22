"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addItemAction } from "../actions/addItem";
import { deleteItemAction } from "../actions/deleteItem";
import { toggleItemCheckAction } from "../actions/toggleItemCheck";
import type { ShoppingListItemViewModel } from "../types";
import { AddItemForm } from "./AddItemForm";
import { CompletedItemsSection } from "./CompletedItemsSection";
import { ShoppingListItemRow } from "./ShoppingListItemRow";

type OptimisticUpdater = (
  items: ShoppingListItemViewModel[],
) => ShoppingListItemViewModel[];

interface ShoppingListDetailClientProps {
  listId: string;
  coupleId: string;
  initialItems: ShoppingListItemViewModel[];
  currentUserDisplayName: string;
}

export function ShoppingListDetailClient({
  listId,
  coupleId,
  initialItems,
  currentUserDisplayName,
}: ShoppingListDetailClientProps) {
  const router = useRouter();
  const [optimisticItems, setOptimisticItems] = useState(initialItems);
  const serverSnapshotRef = useRef(initialItems);

  useEffect(() => {
    serverSnapshotRef.current = initialItems;
    setOptimisticItems(initialItems);
  }, [initialItems]);

  const refreshAfterMutation = () => {
    router.refresh();
  };

  const revertToServerSnapshot = () => {
    setOptimisticItems(serverSnapshotRef.current);
  };

  const applyOptimisticUpdate = (updater: OptimisticUpdater) => {
    setOptimisticItems((prev) => updater(prev));
  };

  const createOptimisticItem = (name: string): ShoppingListItemViewModel => ({
    id: `temp-${crypto.randomUUID()}`,
    name,
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
    if (typeof name !== "string" || name.trim() === "") {
      return;
    }

    const optimisticItem = createOptimisticItem(name.trim());
    applyOptimisticUpdate((items) => [...items, optimisticItem]);

    try {
      await addItemAction(formData);
      refreshAfterMutation();
    } catch (error) {
      console.error("アイテムの追加に失敗しました", error);
      revertToServerSnapshot();
    }
  };

  const handleToggleItem = async (itemId: string) => {
    applyOptimisticUpdate((items) =>
      items.map((item) => {
        if (item.id !== itemId) {
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
      }),
    );

    try {
      await toggleItemCheckAction(itemId);
      refreshAfterMutation();
    } catch (error) {
      console.error("アイテムのチェック切り替えに失敗しました", error);
      revertToServerSnapshot();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    applyOptimisticUpdate((items) => items.filter((item) => item.id !== itemId));

    try {
      await deleteItemAction(itemId);
      refreshAfterMutation();
    } catch (error) {
      console.error("アイテムの削除に失敗しました", error);
      revertToServerSnapshot();
    }
  };

  const uncheckedItems = optimisticItems.filter(
    (item) => !(item.state?.isChecked ?? false),
  );
  const checkedItems = optimisticItems.filter(
    (item) => item.state?.isChecked ?? false,
  );

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
