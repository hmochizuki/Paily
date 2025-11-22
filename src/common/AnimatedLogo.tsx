type LogoSize = "sm" | "md" | "lg";

const sizeClasses: Record<LogoSize, string> = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

type AnimatedLogoProps = {
  /**
   * @description デフォルトはミドルサイズ。用途に応じて調整。
   */
  readonly size?: LogoSize;
  /**
   * @description アクセシビリティ用のラベル。画面上では表示されない。
   */
  readonly label?: string;
};

export function AnimatedLogo({
  size = "md",
  label = "ふたりの暮らしロゴ",
}: AnimatedLogoProps) {
  const containerClassName = `animated-logo ${sizeClasses[size]}`;

  return (
    <div className={containerClassName} role="img" aria-label={label}>
      <div className="animated-logo__glow" aria-hidden="true" />
      <svg
        viewBox="0 0 96 96"
        className="animated-logo__icon"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand)" />
            <stop offset="100%" stopColor="var(--color-brand-hover)" />
          </linearGradient>
        </defs>
        <circle
          cx="48"
          cy="48"
          r="32"
          fill="url(#logoGradient)"
          opacity="0.95"
        />
        <path
          d="M48 70.5l-3.4-3.2C34.8 59 28 52.7 28 43.7 28 36 34 30 42 30c3.8 0 7.4 1.5 10 4.1C54.6 31.5 58.2 30 62 30c8 0 14 6 14 13.7 0 9-6.8 15.2-16.6 23.6Z"
          fill="var(--color-brand-contrast)"
        />
        <path
          d="M38 36c-3.3 0-6 2.7-6 6.1 0 6.1 5.3 11 13.8 19l2.2 2 2.2-2C58.7 53.1 64 48.2 64 42.1c0-3.4-2.7-6.1-6-6.1-2.9 0-5.5 2.1-6.2 5L48 44.3l-3.8-3.3c-0.7-2.9-3.3-5-6.2-5Z"
          fill="var(--color-bg-elevated)"
          opacity="0.95"
        />
      </svg>
    </div>
  );
}
