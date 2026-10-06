import {
  CheckCircle2Icon,
  ClockIcon,
  TriangleAlertIcon,
  XCircleIcon,
} from "lucide-react";
import type { Metadata } from "next";
import {
  PaymentProviderBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { LinkButton } from "@/components/ui/link-button";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { pageMetadata } from "@/lib/seo";
import type { PaymentDetail } from "@/lib/types";
import { paymentService } from "@/service/payments";

export const metadata: Metadata = pageMetadata({
  title: "Payment received",
  description: "Result of your CodeArena credit purchase.",
  path: "/payment/success",
  noIndex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </span>
  );
}

function Receipt({ payment }: { payment: PaymentDetail }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Payment id", value: payment.id },
    {
      label: "Status",
      value: <PaymentStatusBadge value={payment.status} />,
    },
    {
      label: "Amount",
      value: (
        <span className="font-semibold">{formatCurrency(payment.amount)}</span>
      ),
    },
    {
      label: "Credits granted",
      value: (
        <span className="font-semibold">
          {formatNumber(payment.creditsGranted)}
        </span>
      ),
    },
    { label: "Provider reference", value: payment.providerRef },
    { label: "Company", value: payment.company.name },
    { label: "Created", value: formatDateTime(payment.createdAt) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-heading text-base font-bold tracking-tight">
            Receipt
          </h2>
          <div className="flex items-center gap-2">
            <PaymentStatusBadge value={payment.status} />
            <PaymentProviderBadge value={payment.provider} />
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`flex flex-col gap-0.5 ${
                row.label === "Amount" || row.label === "Credits granted"
                  ? "sm:col-span-2"
                  : ""
              }`}
            >
              <SectionLabel>{row.label}</SectionLabel>
              <dd className="text-sm break-all">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Outcome({
  Icon,
  title,
  body,
  tone = "default",
  children,
}: {
  Icon: typeof CheckCircle2Icon;
  title: string;
  body: string;
  tone?: "success" | "warning" | "danger" | "info" | "default";
  children?: React.ReactNode;
}) {
  const toneConfig = {
    success: {
      iconBg: "bg-success/10 text-success ring-success/20",
      border: "border-success/30",
      badge: "success" as const,
    },
    warning: {
      iconBg: "bg-warning/10 text-warning ring-warning/20",
      border: "border-warning/30",
      badge: "warning" as const,
    },
    danger: {
      iconBg: "bg-destructive/10 text-destructive ring-destructive/20",
      border: "border-destructive/30",
      badge: "danger" as const,
    },
    info: {
      iconBg: "bg-info/10 text-info ring-info/20",
      border: "border-info/30",
      badge: "info" as const,
    },
    default: {
      iconBg: "bg-brand-soft text-brand ring-brand/15",
      border: "border-border/70",
      badge: "neutral" as const,
    },
  };

  const config = toneConfig[tone];

  return (
    <div className="mx-auto flex w-full max-w-2xl animate-fade-up flex-col gap-5 px-4 py-14 sm:px-6 sm:py-20">
      <div
        className={`flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8 ${config.border}`}
      >
        <span
          className={`flex size-12 items-center justify-center rounded-xl ring-1 ${config.iconBg}`}
        >
          <Icon className="size-6" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h1>
          <p className="text-sm/relaxed text-muted-foreground sm:text-base">
            {body}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

const billingActions = (
  <div className="flex flex-wrap items-center gap-2">
    <LinkButton href="/dashboard/recruiter/billing">Go to billing</LinkButton>
    <LinkButton href="/dashboard/recruiter/assessments" variant="outline">
      Back to assessments
    </LinkButton>
  </div>
);

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const sessionId = (first(raw.session_id) ?? "").trim();

  if (sessionId === "") {
    return (
      <Outcome
        Icon={TriangleAlertIcon}
        title="No checkout session to check"
        body="This page is only meaningful when Stripe sends you back from checkout with a session id. Open it directly and there is nothing to confirm."
        tone="warning"
      >
        {billingActions}
      </Outcome>
    );
  }

  const history = await paymentService.history(1, 100);

  if (history.statusCode === 401) {
    return (
      <Outcome
        Icon={TriangleAlertIcon}
        title="Sign in to see your receipt"
        body={`Checkout for session ${sessionId} may have completed, but this page needs your session to read the payment record. Sign in and reload.`}
        tone="warning"
      >
        {billingActions}
      </Outcome>
    );
  }

  if (!history.success || !history.data) {
    return (
      <Outcome
        Icon={TriangleAlertIcon}
        title="Could not load your payments"
        body={history.message || VALIDATION_MESSAGES.unknown}
        tone="danger"
      >
        {billingActions}
      </Outcome>
    );
  }

  const match = history.data.items.find(
    (payment) => payment.providerRef === sessionId,
  );

  if (!match) {
    return (
      <Outcome
        Icon={ClockIcon}
        title="Still confirming your payment"
        body={`No payment in your most recent ${history.data.items.length} of ${history.data.meta.total} records matches session ${sessionId} yet. Stripe calls the API by webhook after you leave the checkout page, so a short delay is normal — reload in a moment.`}
        tone="info"
      >
        {billingActions}
        {history.data.meta.totalPages > 1 ? (
          <p className="text-xs/relaxed text-muted-foreground">
            Your history has {history.data.meta.totalPages} pages and only the
            first {history.data.items.length} were searched, so an older
            checkout may live on another page of the billing history.
          </p>
        ) : null}
      </Outcome>
    );
  }

  const detail = await paymentService.detail(match.id);

  if (!detail.success || !detail.data) {
    return (
      <Outcome
        Icon={TriangleAlertIcon}
        title="Found the payment, could not read it"
        body={detail.message || VALIDATION_MESSAGES.unknown}
        tone="danger"
      >
        {billingActions}
      </Outcome>
    );
  }

  const payment = detail.data;

  if (payment.status === "PAID") {
    return (
      <Outcome
        Icon={CheckCircle2Icon}
        title="Payment confirmed"
        body={`${formatNumber(payment.creditsGranted)} credits have been added to your balance. They are spent one per accepted candidate invitation.`}
        tone="success"
      >
        <Receipt payment={payment} />
        {billingActions}
      </Outcome>
    );
  }

  if (payment.status === "PENDING") {
    return (
      <Outcome
        Icon={ClockIcon}
        title="Payment received, credits not granted yet"
        body="The payment record exists and is still PENDING. Credits are granted by the provider webhook, which has not fired for this session — this is not a failure, and no action is needed from you."
        tone="warning"
      >
        <Receipt payment={payment} />
        {billingActions}
      </Outcome>
    );
  }

  return (
    <Outcome
      Icon={XCircleIcon}
      title={
        payment.status === "FAILED" ? "Payment failed" : "Payment was refunded"
      }
      body={
        payment.status === "FAILED"
          ? `The provider recorded this payment as ${PAYMENT_STATUS_LABELS[payment.status].toLowerCase()}, so no credits were granted. You can try checkout again from the billing page.`
          : `This payment has been refunded, so the ${formatNumber(payment.creditsGranted)} credits it granted may no longer be on your balance.`
      }
      tone={payment.status === "FAILED" ? "danger" : "info"}
    >
      <Receipt payment={payment} />
      {billingActions}
    </Outcome>
  );
}
