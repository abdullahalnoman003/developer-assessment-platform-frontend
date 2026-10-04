import { CoinsIcon, GlobeIcon, ImageIcon } from "lucide-react";
import Image from "next/image";
import { CompanyForm } from "@/app/(recruiterSection)/_components/company-form";
import { DashboardPanel } from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatsCards } from "@/components/shared/stats-cards";
import { LinkButton } from "@/components/ui/link-button";
import { formatDate, formatNumber, isValidHttpUrl } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import type { ApiResponse, Company, CompanyDashboard } from "@/lib/types";

export interface CompanyPanelProps {
  company: ApiResponse<Company>;
  dashboard: ApiResponse<CompanyDashboard>;
}

export function CompanyPanel({ company: res, dashboard }: CompanyPanelProps) {
  if (!res.success || !res.data) {
    const isOnboarding = res.statusCode === 404 || res.statusCode === 403;

    if (!isOnboarding) {
      return (
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      );
    }

    return (
      <EmptyState
        action={
          <LinkButton
            href="/dashboard/recruiter/company"
            size="sm"
            variant="outline"
          >
            Set up your company
          </LinkButton>
        }
        body={EMPTY_STATES.company.body}
        Icon={GlobeIcon}
        title={EMPTY_STATES.company.title}
      />
    );
  }

  const company = res.data;

  const credits =
    dashboard.success && dashboard.data
      ? dashboard.data.company.creditsRemaining
      : company.creditsRemaining;

  return (
    <>
      <StatsCards
        items={[
          {
            label: "Credits remaining",
            value: formatNumber(credits),
            hint: "Topped up by a settled payment",
            Icon: CoinsIcon,
            tone: credits > 0 ? "success" : "danger",
          },
          {
            label: "Member since",
            value: formatDate(company.createdAt),
            hint: `Last updated ${formatDate(company.updatedAt)}`,
            Icon: GlobeIcon,
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
                {isValidHttpUrl(company.website) ? (
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
                    {company.website || "No website set"}
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
