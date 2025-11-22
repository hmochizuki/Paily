export interface CalendarEventViewModel {
  id: string;
  coupleId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  isAllDay: boolean;
  color: string | null;
  createdBy: {
    displayName: string;
  };
  /**
   * 楽観的に追加・更新されたデータかどうかを示すフラグ
   */
  isOptimistic?: boolean;
}
