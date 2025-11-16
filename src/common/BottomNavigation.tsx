"use client";

import Link from "next/link";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface BottomNavigationProps {
  activeIndex?: number;
}

const navItems: NavItem[] = [
  {
    label: "リスト",
    href: "/lists",
    icon: (
      <svg
        className="w-6 h-6 mb-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="リスト"
      >
        <title>リスト</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    label: "カレンダー",
    href: "/calendar",
    icon: (
      <svg
        className="w-6 h-6 mb-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="カレンダー"
      >
        <title>カレンダー</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "プロフィール",
    href: "/settings/profile",
    icon: (
      <svg
        className="w-6 h-6 mb-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="プロフィール"
      >
        <title>プロフィール</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export default function BottomNavigation({
  activeIndex = 0,
}: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[var(--z-index-bottom-nav)]">
      <div className="grid grid-cols-3 py-2">
        {navItems.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center py-2 transition-colors ${
              index === activeIndex
                ? "text-[var(--color-brand-hover)]"
                : "text-gray-600"
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
