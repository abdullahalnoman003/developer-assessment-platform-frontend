import { type NextRequest, NextResponse } from "next/server";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/lib/types";

const ROLE_GATES: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard/admin", role: "ADMIN" },
  { prefix: "/dashboard/recruiter", role: "RECRUITER" },
  { prefix: "/dashboard/candidate", role: "CANDIDATE" },
];

const AUTH_ROUTES = ["/login", "/register"] as const;

// signed in, but not owned by one role
const SHARED_AUTH_ROUTES = ["/profile"] as const;

const ACCESS_COOKIE = "accessToken";

interface TokenPayload {
  id?: unknown;
  role?: unknown;
}

function decodeRole(token: string | undefined): Role | null {
  if (!token) return null;
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(
      normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "=",
      ),
    );
    const payload = JSON.parse(json) as TokenPayload;
    const role = payload.role;
    if (role === "ADMIN" || role === "RECRUITER" || role === "CANDIDATE") {
      return role;
    }
    return null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/profile") &&
    !AUTH_ROUTES.some((route) => pathname === route)
  ) {
    return NextResponse.next();
  }

  const role = decodeRole(request.cookies.get(ACCESS_COOKIE)?.value);

  const gate = ROLE_GATES.find(
    (entry) =>
      pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  if (gate) {
    if (!role) {
      return redirectToLogin(request);
    }
    if (role !== gate.role) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
    return NextResponse.next();
  }

  const isShared = SHARED_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (isShared) {
    if (!role) {
      return redirectToLogin(request);
    }
    return NextResponse.next();
  }

  if (role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = new URL("/login", request.url);
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  // reject protocol-relative targets so redirectTo cannot leave the site
  if (target.startsWith("/") && !target.startsWith("//")) {
    url.searchParams.set("redirectTo", target);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
