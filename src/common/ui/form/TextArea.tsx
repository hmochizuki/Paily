import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function TextArea({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: TextAreaProps) {
  const textareaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-[var(--color-text-default)] mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
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
          resize-y
          transition-all duration-200
          ${error ? "border-[var(--color-danger)]" : ""}
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className="mt-1 text-sm text-[var(--color-text-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
}