export default function CalendarLoadingSkeleton() {
  return (
    <div className="flex h-full flex-1 flex-col px-4 pb-4 pt-2">
      <div className="space-y-6 w-full pb-24 pt-2">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
            カレンダー
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            ふたりの予定を共有できます。
          </p>
        </div>

        <div className="animate-pulse">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-4">
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-gray-100 rounded"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}