"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import Button from "@/common/ui/form/Button";
import TextField from "@/common/ui/form/TextField";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type AuthMode = "sign-in" | "sign-up";

type AuthError = {
  message: string;
};

export default function LoginForm() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState<AuthError | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAuth(formData: FormData) {
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const password = (formData.get("password") as string | null)?.trim() ?? "";

    if (!email || !password) {
      setError({ message: "メールアドレスとパスワードを入力してください" });
      return;
    }

    setError(null);

    startTransition(async () => {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError({ message: signInError.message });
          return;
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError({ message: signUpError.message });
          return;
        }

        const userId = data.user?.id;
        if (userId) {
          await supabase.from("profiles").upsert({
            id: userId,
            display_name: email.split("@")[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      router.replace("/couple/create");
      router.refresh();
    });
  }

  return (
    <form action={handleAuth} className="space-y-6" autoComplete="on">
      <div className="space-y-2">
        <TextField
          name="email"
          type="email"
          label="メールアドレス"
          placeholder="name@example.com"
          required
        />
        <TextField
          name="password"
          type="password"
          label="パスワード"
          placeholder="8文字以上のパスワード"
          minLength={8}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--color-danger)]">{error.message}</p>
      )}

      <Button type="submit" fullWidth disabled={isPending}>
        {mode === "sign-in" ? "ログイン" : "アカウントを作成"}
      </Button>

      <div className="text-sm text-center text-[var(--color-text-muted)]">
        {mode === "sign-in" ? (
          <button
            type="button"
            className="text-[var(--color-brand)] underline"
            onClick={() => setMode("sign-up")}
            disabled={isPending}
          >
            アカウントをお持ちでない方はこちら
          </button>
        ) : (
          <button
            type="button"
            className="text-[var(--color-brand)] underline"
            onClick={() => setMode("sign-in")}
            disabled={isPending}
          >
            既にアカウントをお持ちの方はこちら
          </button>
        )}
      </div>
    </form>
  );
}
