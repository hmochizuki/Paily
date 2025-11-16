"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "selectedSpaceId";

export function useSelectedSpace() {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setSelectedSpaceId(stored);
    setIsLoading(false);
  }, []);

  const selectSpace = useCallback((spaceId: string) => {
    localStorage.setItem(STORAGE_KEY, spaceId);
    setSelectedSpaceId(spaceId);
  }, []);

  const clearSpace = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedSpaceId(null);
  }, []);

  return {
    selectedSpaceId,
    selectSpace,
    clearSpace,
    isLoading,
  };
}
