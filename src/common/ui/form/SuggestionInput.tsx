"use client";

import {
  type ForwardedRef,
  forwardRef,
  type InputHTMLAttributes,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface SuggestionInputProps extends InputHTMLAttributes<HTMLInputElement> {
  suggestions?: string[];
  maxSuggestions?: number;
  onSuggestionSelect?: (value: string) => void;
}

function assignRef(
  ref: ForwardedRef<HTMLInputElement>,
  node: HTMLInputElement | null,
) {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    (ref as RefObject<HTMLInputElement | null>).current = node;
  }
}

export const SuggestionInput = forwardRef<
  HTMLInputElement,
  SuggestionInputProps
>(
  (
    {
      suggestions = [],
      maxSuggestions = 30,
      onSuggestionSelect,
      className = "",
      onChange,
      onFocus,
      onBlur,
      value,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState(typeof value === "string" ? value : "");

    useEffect(() => {
      if (typeof value === "string") {
        setQuery(value);
      }
    }, [value]);

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = useMemo(() => {
      if (normalizedQuery === "") {
        return suggestions.slice(0, maxSuggestions);
      }
      return suggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(normalizedQuery),
        )
        .slice(0, maxSuggestions);
    }, [suggestions, normalizedQuery, maxSuggestions]);

    const showSuggestions = isFocused && filtered.length > 0;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
      onChange?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => setIsFocused(false), 100);
      onBlur?.(event);
    };

    const handleSuggestionSelect = (suggestion: string) => {
      onSuggestionSelect?.(suggestion);
      setQuery(suggestion);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    };

    return (
      <div className="relative w-full">
        <input
          ref={(node) => {
            inputRef.current = node;
            assignRef(ref, node);
          }}
          value={value}
          className={className}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          aria-autocomplete="list"
          {...rest}
        />
        {showSuggestions && (
          <ul className="absolute left-0 right-0 top-full z-[var(--z-index-popover)] mt-1 max-h-48 overflow-auto rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] shadow-lg">
            {filtered.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-subtle)]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <span>{suggestion}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

SuggestionInput.displayName = "SuggestionInput";
