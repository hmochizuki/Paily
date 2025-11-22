import type { ReactNode } from "react";
import BottomNavigation from "@/common/ui/layout/BottomNavigation";
import Header from "@/common/ui/layout/Header";
import { requireUser } from "@/lib/auth";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  await requireUser();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24 pt-14">{children}</main>
      <BottomNavigation />
    </div>
  );
}
