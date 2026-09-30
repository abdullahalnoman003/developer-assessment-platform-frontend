import Link from "next/link";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";

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
      { href: "/terms", label: "Terms & privacy" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <p className="font-heading text-sm font-semibold text-gradient-brand">
            {APP_NAME}
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Developer assessments, coding tests and evaluation in one place.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading} className="flex flex-col gap-3">
            <p className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {column.heading}
            </p>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <p className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Explore
          </p>
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 font-mono text-xs text-muted-foreground">
          {APP_NAME} — built on the CodeArena API.
        </p>
      </div>
    </footer>
  );
}
