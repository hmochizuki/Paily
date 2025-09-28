export const metadata = {
  title: "共有リスト",
};

export default function ListsPage() {
  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          共有リスト
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          買い物リストの一覧を表示します。
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
        リスト一覧コンポーネントはこれから実装されます。
      </div>
    </div>
  );
}
