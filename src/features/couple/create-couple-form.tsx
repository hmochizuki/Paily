"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  useEffect(() => {
    if (state.status === "success") {
      setDialogOpen(true);
      setCopyStatus("idle");
    }
  }, [state]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.warn("Failed to copy invite link", error);
      setCopyStatus("error");
    }
  };

  return (
    <>
      <form
        action={(formData) => {
          formData.set("timezone", "Asia/Tokyo");
          if (typeof window !== "undefined") {
            formData.set("origin", window.location.origin);
          }
          startTransition(() => {
            formAction(formData);
          });
        }}
        className="space-y-6"
      >
        <div className="grid gap-4">
          <input type="hidden" name="timezone" value="Asia/Tokyo" />

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

      {dialogOpen && state.status === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[var(--color-text-default)]">
                共有リンクをコピー
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                パートナーに共有するリンクです。コピーして送信してください。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                readOnly
                value={state.inviteUrl}
                className="flex-1 truncate rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-default)] focus:outline-none"
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button
                type="button"
                onClick={() => handleCopy(state.inviteUrl)}
                disabled={copyStatus === "copied"}
              >
                {copyStatus === "copied" ? "コピー済" : "コピー"}
              </Button>
            </div>

            {copyStatus === "error" && (
              <p className="text-xs text-[var(--color-danger)]">
                コピーに失敗しました。手動で選択してください。
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
