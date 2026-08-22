"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardNavTabsProps {
  isAdmin: boolean;
}

interface NavTab {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
  adminOnly?: boolean;
}

const DASHBOARD_TABS: NavTab[] = [
  {
    label: "Ítems de Necesidad",
    href: "/dashboard",
    isActive: (pathname) =>
      pathname === "/dashboard" || pathname.startsWith("/dashboard/needs"),
  },
  {
    label: "Recepción de Donaciones",
    href: "/dashboard/intake",
    isActive: (pathname) => pathname === "/dashboard/intake",
  },
  {
    label: "Miembros del Equipo",
    href: "/dashboard/members",
    isActive: (pathname) => pathname === "/dashboard/members",
    adminOnly: true,
  },
];

export function DashboardNavTabs({ isAdmin }: DashboardNavTabsProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex [scrollbar-width:none] gap-2 overflow-x-auto border-b border-[var(--border)] text-xs font-medium [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Pestañas de navegación operativa"
    >
      {DASHBOARD_TABS.map((tab) => {
        if (tab.adminOnly && !isAdmin) {
          return null;
        }

        const active = tab.isActive(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex min-h-[42px] items-center border-b-2 px-3.5 pt-1 pb-2.5 text-xs whitespace-nowrap transition-colors focus:outline-none ${
              active
                ? "border-[var(--primary)] font-bold text-[var(--primary)]"
                : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
