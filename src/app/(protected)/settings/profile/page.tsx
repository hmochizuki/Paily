import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/features/auth/actions/logout";
import { EditDisplayNameForm } from "@/features/profile/components/EditDisplayNameForm";
import { SpaceSelector } from "@/features/space/components/SpaceSelector";
import { requireUser } from "@/lib/auth";
import { getProfileSettingsData } from "@/server/services/profile";
import { ProfilePageSkeleton } from "./_components/ProfilePageSkeleton";

export const metadata = {
  title: "プロフィール設定",
};

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6 px-4 pt-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          プロフィール設定
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          プロフィール情報の確認とログアウトができます。
        </p>
      </div>

      <Suspense fallback={<ProfilePageSkeleton />}>
        <ProfileSettingsContent />
      </Suspense>
    </div>
  );
}

async function ProfileSettingsContent() {
  const user = await requireUser();
  const cached = await getProfileSettingsData(user.id);

  if (!cached.profile) {
    redirect("/");
  }

  const profile = cached.profile;

  const hasCouple = cached.spaces.length > 0;

  return (
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
            <dd className="mt-1">
              <EditDisplayNameForm currentName={profile.displayName} />
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

      {hasCouple ? (
        <SpaceSelector spaces={cached.spaces} currentUserId={profile.displayName} />
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--color-brand)] bg-pink-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-default)]">
            共有スペースを作成
          </h2>
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">
            パートナーと共有リストやカレンダーを使うには、共有スペースを作成してください。
          </p>
          <Link
            href="/couple/create"
            className="inline-block rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-contrast)] transition-colors hover:bg-[var(--color-brand-hover)]"
          >
            スペースを作成
          </Link>
        </div>
      )}

      {hasCouple && (
        <Link
          href="/couple/create"
          className="block w-full rounded-lg border border-[var(--color-border-default)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-subtle)]"
        >
          新しいスペースを作成
        </Link>
      )}

      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-lg border border-[var(--color-border-default)] bg-white px-4 py-3 text-center text-sm font-medium text-[var(--color-text-destructive)] transition-colors hover:bg-[var(--color-bg-subtle)]"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
