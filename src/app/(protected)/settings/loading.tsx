export default function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          プロフィール
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          あなたの情報と共有スペースの設定
        </p>
      </div>

      <div className="space-y-6">
        <section className="animate-pulse">
          <h2 className="text-base font-semibold text-[var(--color-text-default)] mb-3">
            基本情報
          </h2>
          <div className="space-y-2 rounded-lg border border-[var(--color-border-default)] bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </section>

        <section className="animate-pulse">
          <h2 className="text-base font-semibold text-[var(--color-text-default)] mb-3">
            共有スペース
          </h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-4">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-48" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}