import type { Metadata } from "next";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Payment received");

export default function PaymentSuccessPage() {
  return (
    <>
      <h1>Payment received</h1>
      <p>
        TODO: resolve session_id against the payments list, show status, credits
        granted, and a "webhook still processing" state.
      </p>
    </>
  );
}
