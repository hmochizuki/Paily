"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { NativeModal } from "@/common/ui/NativeModal";

const MODAL_ANIMATION_DURATION_MS = 300;

interface ListDetailModalShellProps {
  children: ReactNode;
  listTitle: string;
}

export function ListDetailModalShell({
  children,
  listTitle,
}: ListDetailModalShellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => {
      router.back();
    }, MODAL_ANIMATION_DURATION_MS);
  }, [router]);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <NativeModal isOpen={isOpen} contentClassName="max-h-full overflow-y-auto">
      <div className="-mx-4 -mt-4 mb-4 flex items-center justify-between bg-[var(--color-brand)] px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-[var(--color-brand-contrast)]">
          {listTitle}
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-full p-2 text-[var(--color-brand-contrast)] hover:bg-[var(--color-brand-hover)]"
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
