export default function ListsLoadingSkeleton() {
  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          共有リスト
        </h1>
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="relative rounded-lg border border-[var(--color-border-default)] bg-white p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="text-right">
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-24 right-4">
        <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}