"use client";

import { type ReactNode, useEffect } from "react";

type ModalPlacement = "bottom" | "center";

interface NativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  placement?: ModalPlacement;
  /**
   * コンテンツ領域に追加したいクラス
   */
  contentClassName?: string;
  /**
   * オーバーレイをタップした際に閉じるかどうか
   */
  closeOnOverlayClick?: boolean;
}

export function NativeModal({
  isOpen,
  onClose,
  children,
  placement = "bottom",
  contentClassName = "",
  closeOnOverlayClick = true,
}: NativeModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const alignmentClasses =
    placement === "bottom" ? "items-end sm:items-center" : "items-center";
  const containerBase =
    "z-[var(--z-index-modal)] w-full max-w-md bg-white shadow-2xl transition-transform";
  const containerClasses =
    placement === "bottom"
      ? `${containerBase} rounded-t-3xl px-4 pb-6 pt-4 sm:rounded-2xl`
      : `${containerBase} rounded-2xl px-4 pb-6 pt-4`;

  const handleOverlayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (!closeOnOverlayClick) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-[var(--z-index-modal-backdrop)] flex bg-black/50 px-4 py-6 ${alignmentClasses}`}
    >
      {closeOnOverlayClick && (
        <button
          type="button"
          aria-label="モーダルを閉じる"
          className="absolute inset-0 z-0 bg-transparent"
          onClick={onClose}
          onKeyDown={handleOverlayKeyDown}
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        className={`${containerClasses} ${contentClassName} relative z-10`}
      >
        {children}
      </div>
    </div>
  );
}
