"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { NativeModal } from "@/common/ui/NativeModal";

const MODAL_ANIMATION_DURATION_MS = 300;

interface ListDetailModalShellProps {
  children: ReactNode;
}

export function ListDetailModalShell({ children }: ListDetailModalShellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => {
      router.push("/lists");
    }, MODAL_ANIMATION_DURATION_MS);
  }, [router]);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <NativeModal
      isOpen={isOpen}
      onClose={handleClose}
      placement="bottom"
      contentClassName="max-h-full overflow-y-auto"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
          共有リスト
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-full p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
          aria-label="閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="size-5"
            aria-hidden="true"
          >
            <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {children}
    </NativeModal>
  );
}
