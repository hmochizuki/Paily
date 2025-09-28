import LoginForm from "@/features/auth/login-form";

export default function Home() {
  return (
    <div className="px-4 py-10 max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          ふたりの暮らしを整えよう
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          アカウントにログインして共有スペースを作成してください。
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
