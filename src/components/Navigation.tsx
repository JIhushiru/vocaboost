"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Daily", icon: "☀" },
  { href: "/flashcards", label: "Flashcards", icon: "🗂" },
  { href: "/quiz", label: "Quiz", icon: "✎" },
  { href: "/progress", label: "Progress", icon: "📊" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-secondary)]/95 backdrop-blur-md md:static md:border-r md:border-t-0">
      <div className="flex md:flex-col md:w-20 md:h-screen md:py-6">
        <div className="hidden md:flex md:items-center md:justify-center md:mb-8">
          <span className="text-2xl font-bold text-[var(--accent-light)]">V</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs transition-all md:flex-initial md:py-4 md:my-1 md:mx-2 md:rounded-xl ${
                isActive
                  ? "text-[var(--accent-light)] bg-[var(--accent-glow)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
