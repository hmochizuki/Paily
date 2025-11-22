const LIST_SKELETON_IDS = Array.from({ length: 3 }, (_, index) => `list-skeleton-${index}`);

export function ListsPageSkeleton() {
  return (
    <div className="space-y-3">
      {LIST_SKELETON_IDS.map((skeletonId) => (
        <div
          key={skeletonId}
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
  );
}
