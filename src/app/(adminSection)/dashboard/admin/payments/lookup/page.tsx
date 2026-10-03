import { CreditCardIcon, ReceiptIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { PaymentLookupForm } from "@/components/shared/payment-lookup-form";
import {
  PaymentProviderBadge,
  PaymentStatusBadge,
  StatusBadge,
} from "@/components/shared/status-badge";
import {
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { PaymentDetail } from "@/lib/types";
import { recordIdSchema } from "@/lib/validations";
import { paymentService } from "@/service/payments";

export const metadata: Metadata = dashboardMetadata("Payment lookup");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm break-all">{value}</dd>
    </div>
  );
}

function PaymentDetails({ payment }: { payment: PaymentDetail }) {
  return (
    <DashboardPanel
      actions={
        <StatusBadge
          dot={false}
          label={`Credits granted: ${formatNumber(payment.creditsGranted)}`}
          tone="success"
        />
      }
      description="Read-only view of a single payment record."
      title={payment.id}
    >
      <dl className="flex flex-col">
        <DetailRow
          label="Status"
          value={PAYMENT_STATUS_LABELS[payment.status]}
        />
        <DetailRow
          label="Provider"
          value={PAYMENT_PROVIDER_LABELS[payment.provider]}
        />
        <DetailRow label="Amount" value={formatCurrency(payment.amount)} />
        <DetailRow
          label="Company"
          value={`${payment.company.name} (${payment.company.id})`}
        />
        <DetailRow label="Provider reference" value={payment.providerRef} />
        <DetailRow label="Created" value={formatDateTime(payment.createdAt)} />
        <DetailRow label="Updated" value={formatDateTime(payment.updatedAt)} />
      </dl>
    </DashboardPanel>
  );
}

export default async function AdminPaymentLookupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const submitted = (first(raw.id) ?? "").trim();
  const parsedId = recordIdSchema.safeParse({ id: submitted });
  // an absent param is fine, anything present must be a real identifier
  const id = submitted !== "" && parsedId.success ? parsedId.data.id : "";
  const idError =
    submitted !== "" && !parsedId.success
      ? (parsedId.error.issues[0]?.message ?? VALIDATION_MESSAGES.unknown)
      : null;

  let payment: PaymentDetail | null = null;
  let error: string | null = idError;

  if (id && !idError) {
    const res = await paymentService.detail(id);
    if (res.success && res.data) {
      payment = res.data;
    } else {
      error =
        res.statusCode === 404
          ? `No payment matches "${id}". Copy the identifier from a payment record.`
          : res.message || VALIDATION_MESSAGES.unknown;
    }
  }

  return (
    <>
      <DashboardPageHeader
        description="The API has no admin payment list, so fetch any single record by its identifier."
        title="Payment lookup"
      />

      <DashboardPanel
        description="Paste a full payment identifier. The request is scoped to your admin session."
        title="Find a payment"
      >
        <PaymentLookupForm defaultValue={submitted} error={error} />
      </DashboardPanel>

      {payment ? (
        <PaymentDetails payment={payment} />
      ) : (
        <EmptyState
          body={
            idError
              ? "Nothing was looked up, because that is not a valid identifier."
              : id
                ? "Nothing was returned for that identifier."
                : "Enter an identifier above to load a payment. Recruiter billing history lives on the recruiter billing page."
          }
          Icon={submitted ? CreditCardIcon : ReceiptIcon}
          title={
            idError
              ? "Check the identifier"
              : id
                ? "Payment not found"
                : "No payment selected"
          }
          action={
            <Link
              className="text-xs underline underline-offset-4"
              href="/dashboard/admin/audit-logs?entity=Payment"
            >
              View payment audit entries
            </Link>
          }
        />
      )}

      {payment ? (
        <p className="flex flex-wrap items-center gap-2 text-xs/relaxed text-muted-foreground">
          <PaymentStatusBadge value={payment.status} />
          <PaymentProviderBadge value={payment.provider} />
          <span>
            Company credits change only when the provider confirms a payment,
            and no endpoint reverses them.
          </span>
        </p>
      ) : null}
    </>
  );
}
