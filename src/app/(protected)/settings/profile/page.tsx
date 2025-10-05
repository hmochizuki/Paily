import { redirect } from "next/navigation";
import { logoutAction } from "@/features/auth/actions/logout";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "プロフィール設定",
};

export default async function ProfileSettingsPage() {
  const user = await requireUser();

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    redirect("/");
  }

  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          プロフィール設定
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          プロフィール情報の確認とログアウトができます。
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-default)]">
            プロフィール情報
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                表示名
              </dt>
              <dd className="mt-1 text-base text-[var(--color-text-default)]">
                {profile.displayName}
              </dd>
            </div>
            {profile.gender && (
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                  性別
                </dt>
                <dd className="mt-1 text-base text-[var(--color-text-default)]">
                  {profile.gender}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                メールアドレス
              </dt>
              <dd className="mt-1 text-base text-[var(--color-text-default)]">
                {user.email}
              </dd>
            </div>
            {profile.avatarUrl && (
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                  アイコン
                </dt>
                <dd className="mt-2">
                  <div
                    className="size-16 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${profile.avatarUrl})` }}
                    role="img"
                    aria-label={profile.displayName}
                  />
                </dd>
              </div>
            )}
          </dl>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-lg border border-[var(--color-border-default)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--color-text-destructive)] transition-colors hover:bg-[var(--color-bg-subtle)]"
          >
            ログアウト
          </button>
        </form>
      </div>
    </div>
  );
}
