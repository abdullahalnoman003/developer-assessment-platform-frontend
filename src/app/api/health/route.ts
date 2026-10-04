import { NextResponse } from "next/server";
import { getBackendHealth, resetCircuitBreaker } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = getBackendHealth();
  return NextResponse.json(health);
}

export async function POST() {
  resetCircuitBreaker();
  return NextResponse.json({ ok: true });
}
