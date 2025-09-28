interface InvitePageProps {
  params: {
    code: string;
  };
}

export default function InvitePage({ params }: InvitePageProps) {
  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          招待コードを確認
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          招待コード <span className="font-mono">{params.code}</span> でスペースに参加します。
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
        招待受諾フローは今後実装されます。
      </div>
    </div>
  );
}
