interface ListDetailPageProps {
  params: Promise<{
    listId: string;
  }>;
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { listId } = await params;

  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          リスト詳細
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          リストID: {listId}
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
        リスト詳細 UI は今後実装されます。
      </div>
    </div>
  );
}
