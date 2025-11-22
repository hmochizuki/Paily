export interface ShoppingListItemViewModel {
  id: string;
  name: string;
  note: string | null;
  quantity: string | null;
  createdAt: Date;
  addedBy: {
    displayName: string;
  };
  state: {
    isChecked: boolean;
    checkedAt: Date | null;
  } | null;
  /**
   * 楽観的更新で追加された一時的なアイテムかどうかを示すフラグ
   */
  isOptimistic?: boolean;
}
