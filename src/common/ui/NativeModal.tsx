"use client";

import { type ReactNode, useEffect, useState } from "react";

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

const BOTTOM_SHEET_TRANSITION_DURATION = 300;
const CENTER_MODAL_TRANSITION_DURATION = 200;

export function NativeModal({
  isOpen,
  onClose,
  children,
  placement = "bottom",
  contentClassName = "",
  closeOnOverlayClick = true,
}: NativeModalProps) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const isBottomPlacement = placement === "bottom";
  const transitionDuration = isBottomPlacement
    ? BOTTOM_SHEET_TRANSITION_DURATION
    : CENTER_MODAL_TRANSITION_DURATION;

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
    }, transitionDuration);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [isOpen, transitionDuration]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  const alignmentClasses = isBottomPlacement
    ? "items-end sm:items-center"
    : "items-center";
  const overlayPaddingClasses = isBottomPlacement
    ? "px-0 pt-6 pb-0 sm:px-4 sm:py-6"
    : "px-4 py-6";
  const containerBase =
    "z-[var(--z-index-modal)] w-full bg-white shadow-2xl will-change-transform";
  const sizeClasses = isBottomPlacement
    ? "min-h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] max-w-3xl overflow-y-auto sm:min-h-0 sm:max-h-[calc(100vh-4rem)]"
    : "max-h-[calc(100vh-4rem)] max-w-lg";
  const shapeClasses = isBottomPlacement
    ? "rounded-t-3xl px-4 pb-8 pt-4 sm:rounded-2xl"
    : "rounded-2xl px-6 py-6";
  const modalAnimation = isBottomPlacement
    ? `transition-transform duration-300 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"}`
    : `transition-[transform,opacity] duration-200 ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`;
  const containerClasses = `${containerBase} ${sizeClasses} ${shapeClasses} ${modalAnimation}`;
  const overlayAnimationClasses = `transition-opacity ${
    isBottomPlacement ? "duration-300" : "duration-200"
  } ease-out ${isVisible ? "opacity-100" : "opacity-0"}`;

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
      className={`fixed inset-0 z-[var(--z-index-modal-backdrop)] flex bg-black/50 backdrop-blur-sm ${overlayPaddingClasses} ${alignmentClasses} ${overlayAnimationClasses}`}
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
