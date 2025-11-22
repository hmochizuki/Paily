export function ListDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="h-11 flex-1 animate-pulse rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-muted)]" />
        <div className="h-11 w-20 animate-pulse rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-muted)]" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`list-skeleton-${index}`}
            className="animate-pulse rounded-2xl border border-[var(--color-border-default)] bg-white p-4"
          >
            <div className="h-4 w-2/3 rounded bg-[var(--color-bg-muted)]" />
            <div className="mt-3 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
              <div className="h-3 w-1/3 rounded bg-[var(--color-bg-muted)]" />
              <div className="h-3 w-16 rounded bg-[var(--color-bg-muted)]" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-2xl border border-dashed border-[var(--color-border-default)] bg-white p-4">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-bg-muted)]" />
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`completed-skeleton-${index}`}
              className="h-3 w-full animate-pulse rounded bg-[var(--color-bg-muted)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
