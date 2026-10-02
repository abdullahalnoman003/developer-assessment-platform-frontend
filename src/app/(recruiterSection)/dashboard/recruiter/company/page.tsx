import { CoinsIcon, GlobeIcon, ImageIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { CompanyForm } from "@/app/(recruiterSection)/_components/company-form";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatsCards } from "@/components/shared/stats-cards";
import { formatDate, formatNumber } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import { companyService } from "@/service/company";

export const metadata: Metadata = dashboardMetadata("Company");

export default async function RecruiterCompanyPage() {
  const res = await companyService.get();

  if (!res.success || !res.data) {
    // A recruiter who has not created a company yet gets a 404 from
    // `GET /companies/me`. That is onboarding, not failure, so it renders as
    // the create form rather than an error (final.md §6).
    const isOnboarding = res.statusCode === 404 || res.statusCode === 403;

    if (!isOnboarding) {
      return (
        <>
          <DashboardPageHeader title="Company" />
          <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
        </>
      );
    }

    return (
      <>
        <DashboardPageHeader
          description="One company profile owns your question bank, your assessments, and your credit balance."
          title="Create your company"
        />
        <DashboardPanel
          description="Required before you can add questions or build an assessment."
          title="Company details"
        >
          <div className="flex flex-col gap-6">
            <EmptyState
              body={EMPTY_STATES.company.body}
              Icon={GlobeIcon}
              title={EMPTY_STATES.company.title}
            />
            <CompanyForm
              defaults={{ logoUrl: "", name: "", website: "" }}
              isNew
            />
          </div>
        </DashboardPanel>
      </>
    );
  }

  const company = res.data;

  return (
    <>
      <DashboardPageHeader
        description="This is the company candidates see on the invitations you send."
        title="Company"
      />

      <StatsCards
        items={[
          {
            label: "Credits remaining",
            value: formatNumber(company.creditsRemaining),
            hint: "Topped up by a settled payment",
            Icon: CoinsIcon,
            tone: company.creditsRemaining > 0 ? "success" : "danger",
          },
          {
            label: "Member since",
            value: formatDate(company.createdAt),
            hint: `Last updated ${formatDate(company.updatedAt)}`,
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <DashboardPanel title="Details">
          <CompanyForm
            defaults={{
              logoUrl: company.logoUrl ?? "",
              name: company.name,
              website: company.website ?? "",
            }}
            isNew={false}
          />
        </DashboardPanel>

        <div className="flex flex-col gap-4">
          <DashboardPanel
            description="As currently stored by the API."
            title="Preview"
          >
            <div className="flex items-start gap-3">
              {company.logoUrl ? (
                <Image
                  alt={`${company.name} logo`}
                  className="size-12 shrink-0 border border-border bg-background object-contain"
                  height={48}
                  src={company.logoUrl}
                  unoptimized
                  width={48}
                />
              ) : (
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center border border-dashed border-border text-muted-foreground"
                >
                  <ImageIcon className="size-5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold">
                  {company.name}
                </p>
                {company.website ? (
                  <a
                    className="truncate text-xs text-primary underline underline-offset-4"
                    href={company.website}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {company.website}
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No website set
                  </p>
                )}
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel title="Record">
            <dl className="flex flex-col gap-2 text-xs">
              {[
                ["Company ID", company.id],
                ["Created", formatDate(company.createdAt)],
                ["Updated", formatDate(company.updatedAt)],
              ].map(([label, value]) => (
                <div className="flex gap-2" key={label}>
                  <dt className="w-24 shrink-0 text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="min-w-0 flex-1 break-all font-mono">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}
