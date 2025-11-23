"use client";

import { type ReactNode, useEffect, useState } from "react";

interface NativePushProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /**
   * コンテンツ領域に追加したいクラス
   */
  contentClassName?: string;
  /**
   * オーバーレイをタップした際に閉じるかどうか
   */
  closeOnOverlayClick?: boolean;
}

const PUSH_TRANSITION_DURATION = 280;

/**
 * OS ネイティブアプリのような 左→右（戻り動作） / 右→左（進む動作） push 遷移
 */
export function NativePush({
  isOpen,
  onClose,
  children,
  contentClassName = "",
  closeOnOverlayClick = true,
}: NativePushProps) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return;
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => {
      setIsMounted(false);
    }, PUSH_TRANSITION_DURATION);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  if (!isMounted) return null;

  const containerAnimation = `transition-transform duration-300 ease-out ${
    isVisible ? "translate-x-0" : "translate-x-full"
  }`;

  const handleOverlayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (!closeOnOverlayClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[var(--z-index-modal-backdrop)] flex"
    >
      {closeOnOverlayClick && (
        <button
          type="button"
          aria-label="画面を閉じる"
          className="absolute inset-0 z-0 bg-transparent"
          onClick={onClose}
          onKeyDown={handleOverlayKeyDown}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-[var(--z-index-modal)] h-full w-full bg-white shadow-xl will-change-transform ${containerAnimation} ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
