import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/features/auth/login-form";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  if (session?.user) {
    redirect("/lists");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center space-y-10 px-4 py-16">
      <div className="space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-[var(--color-text-default)]">
            ふたりの暮らしを整えよう
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            アカウントにログインして共有スペースを作成してください。
          </p>
        </div>
      </div>

      <LoginForm />

      <div className="text-center text-xs text-[var(--color-text-muted)]">
        <Link href="https://supabase.com" className="underline" target="_blank">
          Supabaseでメールを確認できない場合はこちら
        </Link>
      </div>
    </div>
  );
}
