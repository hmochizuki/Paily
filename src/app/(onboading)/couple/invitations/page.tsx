export const metadata = {
  title: "招待状況",
};

export default function CoupleInvitationsPage() {
  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          招待状況
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          発行済みの招待とステータスを確認します。
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
        招待管理コンポーネントはこれから実装されます。
      </div>
    </div>
  );
}
