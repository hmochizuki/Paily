const PLACEHOLDER_CELL_IDS = Array.from(
  { length: 14 },
  (_, index) => `calendar-placeholder-${index}`,
);

export function CalendarPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col rounded-lg border border-[var(--color-border-default)] bg-white p-4">
      <div className="flex items-center justify-between pb-4">
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid flex-1 grid-cols-7 gap-2">
        {PLACEHOLDER_CELL_IDS.map((cellId) => (
          <div
            key={cellId}
            className="h-12 animate-pulse rounded bg-gray-200"
          />
        ))}
      </div>
    </div>
  );
}
