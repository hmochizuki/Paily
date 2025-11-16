export default function ProfileLoading() {
  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-6">
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
