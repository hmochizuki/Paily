import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function TextField({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: TextFieldProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-default)] mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 
          border border-[var(--color-border-default)] 
          rounded-lg
          bg-[var(--color-bg-elevated)]
          text-[var(--color-text-default)]
          placeholder:text-[var(--color-text-muted)] placeholder:opacity-50
          outline-none
          focus:border-[var(--color-brand)]
          focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-opacity-20
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? "border-[var(--color-danger)]" : ""}
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
              ? `${inputId}-helper`
              : undefined
        }
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-[var(--color-text-muted)]"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
