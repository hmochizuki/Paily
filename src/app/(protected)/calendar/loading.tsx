export default function CalendarLoading() {
  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-4">
          <div className="grid grid-cols-7 gap-2">
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
            <div className="h-12 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
