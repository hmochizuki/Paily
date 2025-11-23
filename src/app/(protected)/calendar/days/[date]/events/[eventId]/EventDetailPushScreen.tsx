"use client";

import { NativePush } from "@/common/ui/NativePush";

interface EventDetailPushScreenProps {
  children: React.ReactNode;
}

export function EventDetailPushScreen({
  children,
}: EventDetailPushScreenProps) {
  return (
    <NativePush isOpen onClose={() => {}}>
      {children}
    </NativePush>
  );
}
