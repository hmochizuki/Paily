"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatedLogo } from "@/common/ui/layout/SplashScreenGate/AnimatedLogo";

const FADE_OUT_DURATION_MS = 600;
const READY_FALLBACK_MS = 4500;

type SplashScreenGateProps = {
  readonly children: ReactNode;
};

export function SplashScreenGate({ children }: SplashScreenGateProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fadeTimerId = useRef<number | null>(null);
  const readyFallbackId = useRef<number | null>(null);
  const isDismissedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleDismiss = () => {
      if (isDismissedRef.current) {
        return;
      }
      isDismissedRef.current = true;
      setIsFadingOut(true);
      fadeTimerId.current = window.setTimeout(() => {
        setIsVisible(false);
      }, FADE_OUT_DURATION_MS);
    };

    const handleReady = () => {
      handleDismiss();
    };

    if (document.readyState === "complete") {
      handleReady();
    } else {
      window.addEventListener("load", handleReady, { once: true });
    }

    readyFallbackId.current = window.setTimeout(handleReady, READY_FALLBACK_MS);

    return () => {
      window.removeEventListener("load", handleReady);
      if (readyFallbackId.current !== null) {
        window.clearTimeout(readyFallbackId.current);
      }
      if (fadeTimerId.current !== null) {
        window.clearTimeout(fadeTimerId.current);
      }
    };
  }, []);

  return (
    <>
      {children}
      {isVisible ? (
        <div
          className="splash-screen"
          data-hidden={isFadingOut ? "true" : "false"}
          aria-live="polite"
        >
          <div className="splash-screen__backdrop" />
          <div className="splash-screen__panel">
            <AnimatedLogo size="lg" />
            <div className="splash-screen__message">
              <p className="splash-screen__title">Paily</p>
              <p className="splash-screen__subtitle">
                ふたりの暮らしを準備しています…
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
