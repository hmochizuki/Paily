import BottomNavigation from "@/common/ui/layout/BottomNavigation";
import Header from "@/common/ui/layout/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-16 pb-20">{children}</main>
      <BottomNavigation />
    </>
  );
}
