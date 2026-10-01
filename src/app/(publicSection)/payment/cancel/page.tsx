import type { Metadata } from "next";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Checkout cancelled");

export default function PaymentCancelPage() {
  return (
    <>
      <h1>Checkout cancelled</h1>
      <p>
        TODO: explain the cancel and link back to the recruiter billing page.
      </p>
    </>
  );
}
