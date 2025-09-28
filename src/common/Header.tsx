import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[var(--color-brand)] shadow-sm z-[var(--z-index-header)]">
      <div className="px-4 py-3 flex items-center gap-2">
        <Image
          src="/favicon.svg"
          alt="Pairy Logo"
          width={24}
          height={24}
          className="brightness-0 invert"
        />
        <h1 className="text-xl font-bold text-[var(--color-brand-contrast)]">
          Pairy
        </h1>
      </div>
    </header>
  );
}
