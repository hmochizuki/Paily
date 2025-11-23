import type { ReplaceDateWithString } from "@/types/replace-date-with-string";

interface CalendarEventCore {
  id: string;
  coupleId: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  isAllDay: boolean;
  color: string | null;
  createdBy: {
    displayName: string;
  };
}

export type CalendarEventDto = ReplaceDateWithString<CalendarEventCore>;

export type CalendarEventViewModel = CalendarEventCore & {
  /**
   * 楽観的に追加・更新されたデータかどうかを示すフラグ
   */
  isOptimistic?: boolean;
};

function toCalendarEventViewModel(
  dto: CalendarEventDto,
): CalendarEventViewModel {
  const { startAt, endAt, ...rest } = dto;
  return {
    ...rest,
    startAt: new Date(startAt),
    endAt: endAt ? new Date(endAt) : null,
  };
}

export function toCalendarEventViewModels(
  dtos: CalendarEventDto[],
): CalendarEventViewModel[] {
  return dtos.map((dto) => toCalendarEventViewModel(dto));
}
