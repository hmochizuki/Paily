"use client";

import { type ReactNode, useEffect, useState } from "react";

interface NativeModalProps {
  isOpen: boolean;
  children: ReactNode;
  /**
   * コンテンツ領域に追加したいクラス
   */
  contentClassName?: string;
}

const BOTTOM_SHEET_TRANSITION_DURATION = 300;

export function NativeModal({
  isOpen,
  children,
  contentClassName = "",
}: NativeModalProps) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const transitionDuration = BOTTOM_SHEET_TRANSITION_DURATION;

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

  const alignmentClasses = "items-end sm:items-center";
  const containerBase =
    "z-[var(--z-index-modal)] w-full bg-white shadow-2xl will-change-transform";
  const sizeClasses = "h-full max-w-lg";
  const shapeClasses = "px-4 pb-8 pt-4";
  const modalAnimation = `transition-transform duration-300 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"}`;
  const containerClasses = `${containerBase} ${sizeClasses} ${shapeClasses} ${modalAnimation}`;
  const overlayAnimationClasses = `transition-opacity duration-300 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`;

  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-[var(--z-index-modal-backdrop)] flex bg-black/50 backdrop-blur-sm ${alignmentClasses} ${overlayAnimationClasses}`}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 ${containerClasses} ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
