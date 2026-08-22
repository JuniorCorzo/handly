"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/features/auth/actions";

interface DashboardHeaderProps {
  orgName: string;
  userEmail: string;
  isAdmin: boolean;
  role?: string;
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

export function DashboardHeader({
  orgName,
  userEmail,
  isAdmin,
  role = "operador",
}: DashboardHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex flex-col gap-6 border-b border-[var(--border)] pb-0">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Brand & Organization context */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-bold tracking-wider text-[var(--primary)] uppercase hover:opacity-90 focus:outline-none"
            >
              Handly Ops
            </Link>
            <span className="text-xs text-[var(--muted)]">•</span>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink)] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              {orgName}
            </span>
            <span className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-xs font-medium text-[var(--muted)] uppercase">
              {isAdmin ? "Admin" : role}
            </span>
          </div>

          <p className="text-xs text-[var(--muted)]">
            Sesión:{" "}
            <span className="font-mono text-[var(--ink)]">{userEmail}</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Link
              href="/dashboard/needs/new"
              className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            >
              <span>+</span>
              <span>Nuevo ítem</span>
            </Link>
          )}

          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex min-h-[38px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs Strip ──────────────────────────── */}
      <nav
        className="-mb-px flex [scrollbar-width:none] gap-2 overflow-x-auto text-xs font-medium [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
              className={`inline-flex min-h-[40px] items-center border-b-2 px-3.5 pt-1 pb-2.5 text-xs whitespace-nowrap transition-colors focus:outline-none ${
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
    </header>
  );
}
