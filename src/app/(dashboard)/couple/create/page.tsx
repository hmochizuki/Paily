import Link from "next/link";
import CreateCoupleForm from "@/features/couple/create-couple-form";

export const metadata = {
  title: "カップルスペースを作成",
};

export default function CoupleCreatePage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          カップルスペースを作成
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          スペース情報と招待メールを設定してください。
        </p>
      </div>

      <CreateCoupleForm />

      <div className="flex justify-end text-sm">
        <Link
          href="/couple/invitations"
          className="text-[var(--color-brand-dark)] underline hover:text-[var(--color-brand)]"
        >
          既存の招待状況を確認する
        </Link>
      </div>
    </div>
  );
}
