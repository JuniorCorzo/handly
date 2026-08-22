"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ACTIVE_LINK_CLASS = "bg-[var(--primary)]/10 text-[var(--primary)]";
const INACTIVE_LINK_CLASS =
  "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--ink)]";

const MOBILE_ACTIVE_LINK_CLASS = "bg-[var(--primary)]/10 text-[var(--primary)]";
const MOBILE_INACTIVE_LINK_CLASS =
  "text-[var(--ink)] hover:bg-[var(--background)]";

export function PublicHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const isNeeds = pathname === "/needs";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)] shadow-2xs transition-colors">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* ── Brand Logo ────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-[var(--radius-xs)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            <span className="text-xl font-bold tracking-tight text-[var(--ink)]">
              Handly
            </span>
          </Link>
          <span className="hidden h-3.5 w-px bg-[var(--border)] sm:inline-block" />
          <span className="hidden items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--background)] px-2.5 py-0.5 text-xs font-semibold text-[var(--muted)] sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Operativa SOS
          </span>
        </div>

        {/* ── Desktop Navigation ─────────────────────────────────── */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navegación principal"
        >
          <Link
            href="/"
            className={`rounded-[var(--radius-xs)] px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
              isHome ? ACTIVE_LINK_CLASS : INACTIVE_LINK_CLASS
            }`}
          >
            Inicio
          </Link>

          <Link
            href="/needs"
            className={`rounded-[var(--radius-xs)] px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
              isNeeds ? ACTIVE_LINK_CLASS : INACTIVE_LINK_CLASS
            }`}
          >
            Insumos Requeridos
          </Link>

          <Link
            href="/#como-funciona"
            className="rounded-[var(--radius-xs)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--background)] hover:text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            Cómo Funciona
          </Link>

          <div className="ml-2 border-l border-[var(--border)] pl-2">
            <Link
              href="/login"
              className="inline-flex min-h-[36px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-3.5 py-1.5 text-xs font-semibold text-[var(--surface)] shadow-2xs transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            >
              Acceso Organizaciones
            </Link>
          </div>
        </nav>

        {/* ── Mobile Action & Hamburger Button ──────────────────── */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/login"
            className="inline-flex min-h-[38px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--surface)] shadow-2xs"
          >
            Acceso
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Abrir menú de navegación"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ───────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-md md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Menú móvil">
            <Link
              href="/"
              className={`flex min-h-[44px] items-center rounded-[var(--radius-xs)] px-3 text-sm font-semibold transition-colors ${
                isHome ? MOBILE_ACTIVE_LINK_CLASS : MOBILE_INACTIVE_LINK_CLASS
              }`}
            >
              Inicio
            </Link>

            <Link
              href="/needs"
              className={`flex min-h-[44px] items-center rounded-[var(--radius-xs)] px-3 text-sm font-semibold transition-colors ${
                isNeeds ? MOBILE_ACTIVE_LINK_CLASS : MOBILE_INACTIVE_LINK_CLASS
              }`}
            >
              Catálogo de Insumos Requeridos
            </Link>

            <Link
              href="/#como-funciona"
              className="flex min-h-[44px] items-center rounded-[var(--radius-xs)] px-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--background)]"
            >
              Cómo Funciona
            </Link>

            <div className="mt-2 border-t border-[var(--border)] pt-2">
              <Link
                href="/login"
                className="flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--surface)] shadow-2xs"
              >
                Acceso para Organizaciones
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
