import { TerminalIcon } from "lucide-react";
import Link from "next/link";
import { APP_NAME, APP_TAGLINE, NAV_LINKS } from "@/lib/constants";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-muted/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 h-56 bg-gradient-brand opacity-[0.07] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dots-faint opacity-40"
      />

      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:pr-8">
          <Link
            className="group flex w-fit items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            href="/"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
              <TerminalIcon className="size-4.5" />
            </span>
            <span className="font-heading text-base font-bold tracking-tight text-gradient-brand">
              {APP_NAME}
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-balance text-muted-foreground">
            {APP_TAGLINE}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading} className="flex flex-col gap-4">
            <p className="font-heading text-xs font-bold tracking-[0.14em] text-foreground uppercase">
              {column.heading}
            </p>
            <ul className="flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="group inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                    href={link.href}
                  >
                    <span className="h-px w-0 bg-brand transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col gap-4">
          <p className="font-heading text-xs font-bold tracking-[0.14em] text-foreground uppercase">
            Explore
          </p>
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  className="group inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                  href={link.href}
                >
                  <span className="h-px w-0 bg-brand transition-all duration-300 group-hover:w-3" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
