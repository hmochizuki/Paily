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
          {spaces.map((space) => (
            <button
              key={space.id}
              type="button"
              onClick={() => selectSpace(space.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                selectedSpaceId === space.id
                  ? "border-[var(--color-brand)] bg-pink-50"
                  : "border-[var(--color-border-default)] hover:bg-[var(--color-bg-subtle)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--color-text-default)]">
                  {getSpaceLabel(space)}
                </span>
                {selectedSpaceId === space.id && (
                  <span className="text-xs font-medium text-[var(--color-brand)]">
                    選択中
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                作成日: {new Date(space.createdAt).toLocaleDateString("ja-JP")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
