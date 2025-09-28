export const metadata = {
  title: "カップルスペースを作成",
};

export default function CoupleCreatePage() {
  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          カップルスペースを作成
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          スペース情報と招待メールを設定してください。
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-center text-sm text-[var(--color-text-muted)]">
        スペース作成フォームは現在実装中です。
      </div>

      <div className="flex justify-end">
        <a
          href="/couple/invitations"
          className="inline-flex items-center rounded-lg border border-[var(--color-border-default)] px-4 py-2 text-sm font-medium text-[var(--color-text-default)]"
        >
          招待状況を確認する
        </a>
      </div>
    </div>
  );
}
