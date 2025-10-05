import BottomNavigation from "@/common/BottomNavigation";
import Header from "@/common/Header";

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
