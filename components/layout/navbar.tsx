"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/new", label: "Neue Session" },
  { href: "/progress", label: "Fortschritt" },
  { href: "/library", label: "Bibliothek" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Nutzer";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-coral flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
              <path d="M5 11c0 3.87 3.13 7 7 7s7-3.13 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-serif font-semibold text-navy text-lg">Voyce</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                pathname.startsWith(item.href) ? "bg-coral/10 text-coral" : "text-muted hover:text-text-main hover:bg-card-bg"
              )}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/new"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-coral text-white hover:bg-[#d4614a] transition-colors shadow-coral">
            + Üben
          </Link>

          {/* User avatar */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-9 h-9 rounded-xl bg-navy text-white text-xs font-bold flex items-center justify-center hover:bg-[#16202e] transition-colors"
            >
              {initials}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-card-hover border border-border/50 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-sm font-medium text-navy truncate">{displayName}</div>
                  <div className="text-xs text-muted truncate">{user?.email}</div>
                </div>
                <div className="p-1">
                  <Link href="/settings" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:bg-card-bg hover:text-text-main transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    Einstellungen
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile burger */}
        <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-card-bg"
          onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/50 bg-white px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              className={cn("px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname.startsWith(item.href) ? "bg-coral/10 text-coral" : "text-muted hover:bg-card-bg"
              )}>
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border mt-2 pt-2">
            <div className="px-4 py-2">
              <div className="text-sm font-medium text-navy">{displayName}</div>
              <div className="text-xs text-muted">{user?.email}</div>
            </div>
            <Link href="/settings" onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm text-muted hover:bg-card-bg">
              Einstellungen
            </Link>
            <button onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50">
              Abmelden
            </button>
          </div>
        </div>
      )}

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
}
