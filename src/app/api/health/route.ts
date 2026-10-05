import { NextResponse } from "next/server";
import { API_BASE, getBackendHealth, resetCircuitBreaker } from "@/lib/api";

export const dynamic = "force-dynamic";

interface ProbeResult {
  reachable: boolean;
  base: string;
  status: number;
  error: string | null;
}

// Hits the backend root rather than /api/v1 so this diagnostic never consumes
// the 100-per-15-minutes API budget.
async function probeBackend(): Promise<ProbeResult> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

  if (!base || !/^https?:\/\//.test(base)) {
    return {
      reachable: false,
      base: base || "(unset)",
      status: 0,
      error:
        "NEXT_PUBLIC_API_URL is not set in this build. Add it on the host and redeploy.",
    };
  }

  try {
    const response = await fetch(`${base}/`, { cache: "no-store" });
    return { reachable: true, base, status: response.status, error: null };
  } catch (error) {
    return {
      reachable: false,
      base,
      status: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET() {
  const health = getBackendHealth();
  const probe = await probeBackend();

  return NextResponse.json({
    ...health,
    apiBase: API_BASE,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "(unset)",
    probe,
  });
}

export async function POST() {
  resetCircuitBreaker();
  return NextResponse.json({ ok: true });
}
