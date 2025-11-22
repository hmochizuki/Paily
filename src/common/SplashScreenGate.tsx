"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatedLogo } from "@/common/AnimatedLogo";

const SPLASH_COOKIE_NAME = "paily_splash_seen";
const SPLASH_SESSION_KEY = "pailySplashSeen";
const FADE_OUT_DURATION_MS = 600;
const READY_FALLBACK_MS = 4500;

type CookieStoreLike = {
  readonly set: (options: {
    readonly name: string;
    readonly value: string;
    readonly path?: string;
    readonly sameSite?: "lax" | "strict" | "none";
  }) => Promise<void>;
};

type SplashScreenGateProps = {
  readonly children: ReactNode;
  /**
   * @description サーバーサイドで取得した Cookie に基づく初期表示制御。
   */
  readonly hasSeenSplash: boolean;
};

export function SplashScreenGate({
  children,
  hasSeenSplash,
}: SplashScreenGateProps) {
  const [isVisible, setIsVisible] = useState(!hasSeenSplash);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fadeTimerId = useRef<number | null>(null);
  const readyFallbackId = useRef<number | null>(null);
  const isDismissedRef = useRef(hasSeenSplash);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const alreadyDismissed =
      hasSeenSplash ||
      sessionStorage.getItem(SPLASH_SESSION_KEY) === "true" ||
      isDismissedRef.current;

    if (alreadyDismissed) {
      isDismissedRef.current = true;
      setIsVisible(false);
      return;
    }

    const persistSplashSeen = () => {
      try {
        sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
      } catch {
        // sessionStorage が無効な環境では何もしない
      }

      try {
        const cookieStoreAPI = (
          window as typeof window & { cookieStore?: CookieStoreLike }
        ).cookieStore;

        if (cookieStoreAPI) {
          void cookieStoreAPI.set({
            name: SPLASH_COOKIE_NAME,
            value: "true",
            path: "/",
            sameSite: "lax",
          });
          return;
        }

        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API 非対応ブラウザ向けフォールバック
        document.cookie = `${SPLASH_COOKIE_NAME}=true; path=/; SameSite=Lax`;
      } catch {
        // cookie を設定できない環境では単に無視
      }
    };

    const handleDismiss = () => {
      if (isDismissedRef.current) {
        return;
      }
      isDismissedRef.current = true;
      setIsFadingOut(true);
      persistSplashSeen();
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
  }, [hasSeenSplash]);

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
