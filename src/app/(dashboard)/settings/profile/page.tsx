export const metadata = {
  title: "プロフィール設定",
};

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          プロフィール設定
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          表示名やアイコンを編集します。
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
        プロフィール編集コンポーネントはこれから実装されます。
      </div>
    </div>
  );
}
