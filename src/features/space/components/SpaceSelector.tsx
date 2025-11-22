"use client";

import { useEffect } from "react";
import { useSelectedSpace } from "@/hooks/useSelectedSpace";

interface Space {
  id: string;
  createdAt: string;
  partners: {
    profile: {
      displayName: string;
    };
  }[];
}

interface SpaceSelectorProps {
  spaces: Space[];
  currentUserId: string;
}

export function SpaceSelector({ spaces, currentUserId }: SpaceSelectorProps) {
  const { selectedSpaceId, selectSpace, isLoading } = useSelectedSpace();

  useEffect(() => {
    if (!isLoading && spaces.length > 0) {
      const isValidSelection =
        selectedSpaceId && spaces.some((s) => s.id === selectedSpaceId);
      if (!isValidSelection) {
        selectSpace(spaces[0].id);
      }
    }
  }, [isLoading, spaces, selectedSpaceId, selectSpace]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 rounded bg-gray-200" />
          <div className="mt-4 h-10 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  const getSpaceLabel = (space: Space) => {
    const otherPartners = space.partners.filter(
      (p) => p.profile.displayName !== currentUserId,
    );
    if (otherPartners.length > 0) {
      return otherPartners.map((p) => p.profile.displayName).join(", ");
    }
    const date = new Date(space.createdAt);
    return `スペース (${date.toLocaleDateString("ja-JP")})`;
  };

  return (
    <div className="rounded-lg border border-[var(--color-border-default)] bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-default)]">
        共有スペース
      </h2>
      {spaces.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          所属しているスペースがありません
        </p>
      ) : (
        <div className="space-y-2">
          {spaces.map((space) => {
            const isSelected = selectedSpaceId === space.id;
            return (
              <button
                key={space.id}
                type="button"
                onClick={() => {
                  selectSpace(space.id);
                }}
                className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? "border-[var(--color-brand)] bg-pink-50 ring-2 ring-[var(--color-brand)]"
                    : "border-[var(--color-border-default)] hover:border-[var(--color-brand)] hover:bg-pink-50/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-4 rounded-full border-2 ${
                        isSelected
                          ? "border-[var(--color-brand)] bg-[var(--color-brand)]"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="size-full text-white"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 8l3 3 5-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-[var(--color-text-default)]">
                      {getSpaceLabel(space)}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-xs font-medium text-white">
                      使用中
                    </span>
                  )}
                </div>
                <p className="mt-1 pl-6 text-xs text-[var(--color-text-muted)]">
                  作成日:{" "}
                  {new Date(space.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
