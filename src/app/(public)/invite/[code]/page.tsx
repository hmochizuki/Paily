import AcceptCoupleInvitationForm from "@/features/couple/accept-couple-invitation-form";

interface InvitePageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;

  return (
    <div className="space-y-6 px-4 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-default)]">
          スペースに参加
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          招待コードを入力してスペースに参加してください
        </p>
      </div>

      <div className="mx-auto max-w-md">
        <AcceptCoupleInvitationForm initialCode={code} />
      </div>
    </div>
  );
}
