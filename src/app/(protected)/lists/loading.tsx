export default function ListsLoading() {
  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--color-border-default)] bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
