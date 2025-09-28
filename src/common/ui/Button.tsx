import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    primary: `
      bg-[var(--color-brand)] text-[var(--color-brand-contrast)]
      hover:bg-[var(--color-brand-hover)] hover:enabled:bg-[var(--color-brand-hover)]
    `,
    secondary: `
      bg-[var(--color-bg-elevated)] text-[var(--color-text-default)]
      border border-[var(--color-border-default)]
      hover:bg-[var(--color-bg-default)] hover:enabled:bg-[var(--color-bg-default)]
    `,
    danger: `
      bg-[var(--color-danger)] text-white
      hover:opacity-90 hover:enabled:opacity-90
    `,
    ghost: `
      bg-transparent text-[var(--color-text-default)]
      hover:bg-[var(--color-bg-default)] hover:enabled:bg-[var(--color-bg-default)]
    `,
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}