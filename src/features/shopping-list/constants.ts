export const SHOPPING_CATEGORIES = [
  { value: "vegetable", label: "野菜・果物" },
  { value: "meat", label: "肉・魚" },
  { value: "dairy", label: "乳製品・卵" },
  { value: "drink", label: "飲料" },
  { value: "snack", label: "お菓子" },
  { value: "frozen", label: "冷凍食品" },
  { value: "seasoning", label: "調味料" },
  { value: "daily", label: "日用品" },
  { value: "other", label: "その他" },
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number]["value"];

export const getCategoryLabel = (value: string): string => {
  const found = SHOPPING_CATEGORIES.find((c) => c.value === value);
  return found?.label ?? value;
};
