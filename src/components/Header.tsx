export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[var(--color-brand)] shadow-sm z-[var(--z-index-header)]">
      <div className="px-4 py-3">
        <h1 className="text-xl font-bold text-[var(--color-brand-contrast)]">Paily</h1>
      </div>
    </header>
  );
}