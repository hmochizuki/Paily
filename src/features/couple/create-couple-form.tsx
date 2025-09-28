"use client";

import { useActionState, useTransition } from "react";
import Button from "@/common/ui/form/Button";
import TextField from "@/common/ui/form/TextField";
import {
  type CreateCoupleState,
  createCoupleAction,
} from "@/features/couple/actions/create-couple";

const INITIAL_STATE: CreateCoupleState = { status: "idle" };

export default function CreateCoupleForm() {
  const [state, formAction] = useActionState(createCoupleAction, INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          formAction(formData);
        });
      }}
      className="space-y-6"
    >
      <div className="grid gap-4">
        <TextField
          name="inviteEmail"
          type="email"
          label="招待メールアドレス"
          placeholder="partner@example.com"
          required
        />

        <TextField
          name="inviteCode"
          label="招待コード（任意）"
          placeholder="英字4〜12文字"
          helperText="未入力の場合は自動で発行されます。"
          inputMode="text"
        />
      </div>

      {state.status === "error" && (
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-light,rgba(229,57,53,0.08))] px-4 py-3 text-sm text-[var(--color-danger)]">
          {state.message}
        </div>
      )}

      <Button type="submit" fullWidth disabled={isPending}>
        スペースを作成
      </Button>
    </form>
  );
}
