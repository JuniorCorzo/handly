"use client";

import Link from "next/link";

import { signOut } from "@/features/auth/actions";

interface DashboardHeaderProps {
  userName: string;
  isAdmin: boolean;
  role?: string;
}

export function DashboardHeader({
  userName,
  isAdmin,
  role = "operador",
}: DashboardHeaderProps) {
  const avatarLetter = (userName[0] || "U").toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)] shadow-2xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
        {/* ── Nombre de la App ─────────────────────────────────── */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-[var(--radius-xs)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          <span className="text-xl font-bold tracking-tight text-[var(--ink)]">
            Handly
          </span>
        </Link>

        {/* ── Usuario y Cerrar Sesión ──────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
              {avatarLetter}
            </div>
            <span className="text-xs font-semibold text-[var(--ink)]">
              {userName}
            </span>
            <span className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)] uppercase">
              {isAdmin ? "Admin" : role}
            </span>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex min-h-[36px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
