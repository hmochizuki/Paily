import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  type,
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg";

  const variantStyles: Record<"primary" | "secondary", string> = {
    primary:
      "text-[var(--color-brand-contrast)] bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] focus:ring-[var(--color-brand)] active:opacity-90",
    secondary:
      "text-[var(--color-text-default)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border-default)] focus:ring-[var(--color-border-default)]",
  };

  const sizeStyles: Record<"sm" | "md" | "lg", string> = {
    sm: "py-2 px-3 text-sm",
    md: "py-3 px-4 text-base",
    lg: "py-4 px-4 text-base",
  };

  return (
    <button
      type={type ?? "button"}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full flex justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
