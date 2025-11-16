export const metadata = {
  title: "スペース設定",
};

export default function CoupleSettingsPage() {
  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          スペース設定
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          カップル名やタイムゾーン、メンバー情報を更新します。
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
        設定フォームはこれから実装されます。
      </div>
    </div>
  );
}
