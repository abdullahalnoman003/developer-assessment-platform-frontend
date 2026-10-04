"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, ROLE_HOME } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
      {NAV_LINKS.map((link) => (
        <LinkButton
          aria-current={
            isActiveHref(pathname, link.href) ? ("page" as const) : undefined
          }
          key={link.href}
          href={link.href}
          size="sm"
          variant={isActiveHref(pathname, link.href) ? "secondary" : "ghost"}
        >
          {link.label}
        </LinkButton>
      ))}
    </nav>
  );
}

const linkClass =
  "rounded-none px-2 py-2 text-sm hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:bg-muted aria-[current=page]:font-medium";

export function MobileNav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            aria-label="Open navigation menu"
            className="md:hidden"
            size="icon"
            variant="outline"
          >
            <MenuIcon className="size-4" />
          </Button>
        }
      />
      <SheetContent className="w-72" side="left">
        <SheetHeader>
          <SheetTitle className="font-heading text-sm">Explore</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <SheetClose
              key={link.href}
              render={
                <Link
                  aria-current={
                    isActiveHref(pathname, link.href)
                      ? ("page" as const)
                      : undefined
                  }
                  className={linkClass}
                  href={link.href}
                />
              }
            >
              {link.label}
            </SheetClose>
          ))}
          <SheetClose
            render={
              <Link
                aria-current={
                  isActiveHref(pathname, "/terms")
                    ? ("page" as const)
                    : undefined
                }
                className={linkClass}
                href="/terms"
              />
            }
          >
            Terms
          </SheetClose>
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
          {user ? (
            <SheetClose
              render={
                <Link
                  aria-current={
                    isActiveHref(pathname, ROLE_HOME[user.role])
                      ? ("page" as const)
                      : undefined
                  }
                  className="border border-border px-3 py-2 text-center text-sm hover:bg-muted"
                  href={ROLE_HOME[user.role]}
                />
              }
            >
              Dashboard
            </SheetClose>
          ) : (
            <>
              <SheetClose
                render={
                  <Link
                    className="border border-border px-3 py-2 text-center text-sm hover:bg-muted"
                    href="/register"
                  />
                }
              >
                Create account
              </SheetClose>
              <SheetClose
                render={
                  <Link
                    className="bg-primary px-3 py-2 text-center text-sm text-primary-foreground hover:bg-primary/80"
                    href="/login"
                  />
                }
              >
                Sign in
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
