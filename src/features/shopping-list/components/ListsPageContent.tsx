"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSelectedSpace } from "@/hooks/useSelectedSpace";
import {
  toListOverviewViewModels,
  type ListOverviewDto,
} from "../types";
import { CreateListButton } from "./CreateListButton";
import { DeleteListButton } from "./DeleteListButton";

interface ListsPageContentProps {
  allListsDto: ListOverviewDto[];
  userSpaceIds: string[];
}

export function ListsPageContent({
  allListsDto,
  userSpaceIds,
}: ListsPageContentProps) {
  const { selectedSpaceId, selectSpace, isLoading } = useSelectedSpace();
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const allLists = useMemo(
    () => toListOverviewViewModels(allListsDto),
    [allListsDto],
  );

  useEffect(() => {
    if (!isLoading && userSpaceIds.length > 0) {
      const isValidSelection =
        selectedSpaceId && userSpaceIds.includes(selectedSpaceId);
      if (isValidSelection) {
        setCurrentSpaceId(selectedSpaceId);
      } else {
        selectSpace(userSpaceIds[0]);
        setCurrentSpaceId(userSpaceIds[0]);
      }
    }
  }, [isLoading, userSpaceIds, selectedSpaceId, selectSpace]);

  if (isLoading || !currentSpaceId) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-12 rounded bg-gray-200" />
          <div className="mt-4 h-24 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  const lists = allLists.filter((list) => list.coupleId === currentSpaceId);

  return (
    <>
      {lists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border-default)] bg-white p-6 text-center text-sm text-[var(--color-text-muted)]">
          まだリストがありません。新しいリストを作成してください。
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="relative rounded-lg border border-[var(--color-border-default)] bg-white transition-colors hover:bg-[var(--color-bg-subtle)]"
            >
              <Link href={`/lists/${list.id}`} className="block p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium text-[var(--color-text-default)]">
                      {list.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      未完了 {list.uncheckedItemCount} 件
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {list.updatedAt.toLocaleDateString("ja-JP")}
                    </p>
                    {!list.isActive && (
                      <span className="mt-1 inline-block rounded-full bg-[var(--color-bg-muted)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                        非アクティブ
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="absolute right-2 top-2">
                <DeleteListButton listId={list.id} listTitle={list.title} />
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateListButton coupleId={currentSpaceId} />
    </>
  );
}
