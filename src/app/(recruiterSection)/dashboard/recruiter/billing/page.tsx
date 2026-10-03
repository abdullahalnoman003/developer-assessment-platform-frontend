import { CoinsIcon, ReceiptIcon, WalletIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BillingPlanCards } from "@/app/(recruiterSection)/_components/billing-plan-cards";
import { PaymentReceiptDialog } from "@/app/(recruiterSection)/_components/payment-receipt-dialog";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { StatsCards } from "@/components/shared/stats-cards";
import {
  PaymentProviderBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  toUrlParamRecord,
} from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { Payment } from "@/lib/types";
import { pagedQuerySchema } from "@/lib/validations";
import { companyService } from "@/service/company";
import { paymentService } from "@/service/payments";

export const metadata: Metadata = dashboardMetadata("Billing");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PATHNAME = "/dashboard/recruiter/billing";
const PAGE_SIZE = 10;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildColumns(): readonly DataTableColumn<Payment>[] {
  return [
    {
      key: "id",
      header: "Payment",
      cell: (payment) => (
        <span className="font-mono text-[11px] break-all text-muted-foreground">
          {payment.id}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (payment) => <PaymentStatusBadge value={payment.status} />,
    },
    {
      key: "provider",
      header: "Provider",
      cell: (payment) => <PaymentProviderBadge value={payment.provider} />,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (payment) => (
        <span className="text-sm font-medium tabular-nums">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      key: "creditsGranted",
      header: "Credits",
      cell: (payment) => (
        <span className="text-sm tabular-nums">
          {formatNumber(payment.creditsGranted)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (payment) => (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {formatDateTime(payment.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Receipt",
      cell: (payment) => (
        <div className="flex justify-end">
          <PaymentReceiptDialog payment={payment} />
        </div>
      ),
    },
  ];
}

export default async function RecruiterBillingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const parsed = pagedQuerySchema.safeParse({ page: first(raw.page) });
  const page = parsed.success ? parsed.data.page : undefined;

  const [company, history] = await Promise.all([
    companyService.get(),
    paymentService.history(page ?? 1, PAGE_SIZE),
  ]);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = first(value);
    if (single) params.set(key, single);
  }
  const urlParams = toUrlParamRecord(params);

  if (!history.success || !history.data) {
    return (
      <>
        <DashboardPageHeader title="Billing" />
        <ErrorState message={history.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  // a persistent company-endpoint outage must not look like a zero balance
  if (!company.success) {
    return (
      <>
        <DashboardPageHeader
          description="Credits are spent one per accepted candidate invitation. Checkout runs on Stripe; this page only ever reads the result."
          title="Billing"
        />
        <ErrorState
          message={
            company.message ||
            "Your company record could not be loaded, so credits cannot be shown."
          }
        />
      </>
    );
  }

  const { items, meta } = history.data;
  const credits = company.data?.creditsRemaining ?? 0;
  const paid = items
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <>
      <DashboardPageHeader
        description="Credits are spent one per accepted candidate invitation. Checkout runs on Stripe; this page only ever reads the result."
        title="Billing"
      />

      <StatsCards
        items={[
          {
            label: "Credits remaining",
            value: formatNumber(credits),
            hint: "Exactly what the API has stored, nothing is simulated here",
            Icon: CoinsIcon,
            tone: credits > 0 ? "success" : "warning",
          },
          {
            label: "Payments",
            value: formatNumber(meta.total),
            hint: "Every checkout this company has started",
            Icon: ReceiptIcon,
            tone: "default",
          },
          {
            label: "Spend on this page",
            value: formatCurrency(paid),
            hint: "Successful payments only, current page",
            Icon: WalletIcon,
            tone: "default",
          },
          {
            label: "Per invitation",
            value: "1 credit",
            hint: "The backend debits once per accepted email",
            Icon: CoinsIcon,
            tone: "default",
          },
        ]}
      />

      <div>
        <h2 className="font-heading text-sm font-semibold tracking-wider uppercase">
          Buy credits
        </h2>
        <p className="mt-1 mb-4 text-sm/relaxed text-muted-foreground">
          The plan catalogue is fixed in the API — there is no endpoint to list
          it, so these three packs mirror the server&apos;s own plan table.
        </p>
        <BillingPlanCards />
      </div>

      <DashboardPanel
        contentClassName="flex flex-col gap-4 p-0 sm:p-0"
        description={`${meta.total} payment${meta.total === 1 ? "" : "s"} recorded`}
        title="Payment history"
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              body={
                page
                  ? "There is nothing on this page. Go back to the first page."
                  : EMPTY_STATES.creditHistory.body
              }
              Icon={ReceiptIcon}
              title={
                page ? "Nothing on this page" : EMPTY_STATES.creditHistory.title
              }
            />
          </div>
        ) : (
          <>
            <DataTable
              caption="Payments started by this company with status, provider, amount, and credits granted"
              columns={buildColumns()}
              getRowKey={(payment) => payment.id}
              rows={items}
            />
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-end">
              <PaginationBar
                label="payments"
                meta={meta}
                pathname={PATHNAME}
                searchParams={urlParams}
              />
            </div>
          </>
        )}
      </DashboardPanel>

      <p className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
        <WalletIcon className="mt-0.5 size-3.5 shrink-0" />A payment stays
        PENDING until Stripe&apos;s webhook confirms it, and credits are granted
        by that same webhook — closing the checkout tab leaves a PENDING row and
        no credits. Cancelling out of Stripe returns you to{" "}
        <Link className="underline underline-offset-4" href="/payment/cancel">
          the cancel page
        </Link>
        , and completing it returns you to{" "}
        <Link className="underline underline-offset-4" href="/payment/success">
          the success page
        </Link>
        .
      </p>
    </>
  );
}
