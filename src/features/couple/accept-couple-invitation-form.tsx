"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import Button from "@/common/ui/form/Button";
import TextField from "@/common/ui/form/TextField";
import {
  type AcceptInvitationState,
  acceptCoupleInvitationAction,
} from "@/server/handlers/coupleHandler";

const INITIAL_STATE: AcceptInvitationState = { status: "idle" };

interface AcceptCoupleInvitationFormProps {
  initialCode?: string;
}

export default function AcceptCoupleInvitationForm({
  initialCode = "",
}: AcceptCoupleInvitationFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    acceptCoupleInvitationAction,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.push("/");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4">
        <TextField
          name="inviteCode"
          label="招待コード"
          placeholder="英字4〜12文字"
          defaultValue={initialCode}
          autoComplete="off"
          required
          disabled={isPending}
          inputMode="text"
        />
      </div>

      {state.status === "error" && (
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-light,rgba(229,57,53,0.08))] px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.message}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? "確認中..." : "スペースに参加する"}
      </Button>
    </form>
  );
}
