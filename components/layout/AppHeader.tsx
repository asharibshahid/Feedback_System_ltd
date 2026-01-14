"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const baseLinks = [
  { label: "Start Check-in", href: "/visitor/checkin" },
  { label: "Admin", href: "/admin" },
];

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Visitors", href: "/admin/visitors" },
  { label: "New Check-in", href: "/visitor/checkin" },
];

const visitorNav = [
  { label: "Back to landing", href: "/" },
  { label: "Exit", href: "/" },
];

export function AppHeader() {
  const pathname = usePathname() ?? "/";
  const { user } = useUser();
  const isAdmin = pathname.startsWith("/admin");
  const isVisitor = pathname.startsWith("/visitor");
  const variantLinks = isAdmin ? adminLinks : [];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#475569]">
        <Link href="/" className="text-base font-semibold text-[#0F172A] tracking-[0.4em]">
          Visitor Control
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {baseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[12px] border border-[#CBD5E1] px-4 py-2 text-xs text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              {link.label}
            </Link>
          ))}
          {variantLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[12px] border border-[#2563EB] bg-[#EFF6FF] px-4 py-2 text-xs text-[#2563EB] transition hover:bg-[#E0F2FE]"
            >
              {link.label}
            </Link>
          ))}
          {isVisitor &&
            visitorNav.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="rounded-[12px] border border-[#CBD5E1] px-4 py-2 text-xs text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                {link.label}
              </Link>
            ))}
          {isAdmin && (
            <div className="flex items-center gap-3">
              {user?.primaryEmailAddress?.emailAddress || user?.fullName ? (
                <span className="text-xs text-[#0F172A]">
                  {user?.primaryEmailAddress?.emailAddress || user?.fullName}
                </span>
              ) : null}
              <SignOutButton>
                <button className="rounded-[12px] border border-[#DC2626] px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-[#DC2626] transition hover:bg-[#fee2e2]">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
