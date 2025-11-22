const SPACE_PLACEHOLDER_IDS = Array.from(
  { length: 2 },
  (_, index) => `profile-space-placeholder-${index}`,
);

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-default)]">
          プロフィール情報
        </h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              表示名
            </dt>
            <dd className="mt-1">
              <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              性別
            </dt>
            <dd className="mt-1">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              メールアドレス
            </dt>
            <dd className="mt-1">
              <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">
              アイコン
            </dt>
            <dd className="mt-2">
              <div className="size-16 rounded-full animate-pulse bg-gray-200" />
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-default)]">
          共有スペース
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          共有スペースの情報を読み込み中です。
        </p>
        <div className="mt-4 space-y-2">
          {SPACE_PLACEHOLDER_IDS.map((placeholderId) => (
            <div
              key={placeholderId}
              className="h-12 w-full animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border-default)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--color-text-default)] opacity-70">
        新しいスペースを作成
      </div>

      <div className="w-full rounded-lg border border-[var(--color-border-default)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--color-text-destructive)] opacity-70">
        ログアウト
      </div>
    </div>
  );
}
