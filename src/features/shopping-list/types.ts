import type { ReplaceDateWithString } from "@/types/replace-date-with-string";

interface ShoppingListItemCore {
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
}

export type ShoppingListItemDto = ReplaceDateWithString<ShoppingListItemCore>;

export type ShoppingListItemViewModel = ShoppingListItemCore & {
  /**
   * 楽観的更新で追加された一時的なアイテムかどうかを示すフラグ
   */
  isOptimistic?: boolean;
};

function toShoppingListItemViewModel(
  dto: ShoppingListItemDto,
): ShoppingListItemViewModel {
  const { createdAt, state, ...rest } = dto;
  return {
    ...rest,
    createdAt: new Date(createdAt),
    state: state
      ? {
          isChecked: state.isChecked,
          checkedAt: state.checkedAt ? new Date(state.checkedAt) : null,
        }
      : null,
  };
}

export function toShoppingListItemViewModels(
  dtos: ShoppingListItemDto[],
): ShoppingListItemViewModel[] {
  return dtos.map((dto) => toShoppingListItemViewModel(dto));
}

interface ListOverviewCore {
  id: string;
  title: string;
  coupleId: string;
  isActive: boolean;
  updatedAt: Date;
  uncheckedItemCount: number;
}

export type ListOverviewDto = ReplaceDateWithString<ListOverviewCore>;
type ListOverviewViewModel = ListOverviewCore;

function toListOverviewViewModel(dto: ListOverviewDto): ListOverviewViewModel {
  const { updatedAt, ...rest } = dto;
  return {
    ...rest,
    updatedAt: new Date(updatedAt),
  };
}

export function toListOverviewViewModels(
  dtos: ListOverviewDto[],
): ListOverviewViewModel[] {
  return dtos.map((dto) => toListOverviewViewModel(dto));
}
