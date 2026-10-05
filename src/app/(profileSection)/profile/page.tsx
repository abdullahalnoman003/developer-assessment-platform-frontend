import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLE_LABELS } from "@/lib/constants";
import { initials } from "@/lib/format";
import { dashboardMetadata } from "@/lib/seo";
import { authService } from "@/service/auth";
import { companyService } from "@/service/company";
import { CandidateProfileForm } from "../_components/candidate-form";
import { CompanyPanel } from "../_components/company-panel";
import { IdentityForm } from "../_components/identity-form";

export const metadata: Metadata = dashboardMetadata("Profile");

export const dynamic = "force-dynamic";

function AccountSummary({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
    role: keyof typeof ROLE_LABELS;
  };
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-brand-soft-gradient p-5 shadow-sm sm:flex-row sm:items-center">
      <Avatar className="size-14 border border-brand/20 shadow-sm" size="lg">
        {user.avatarUrl ? <AvatarImage alt="" src={user.avatarUrl} /> : null}
        <AvatarFallback className="bg-gradient-brand font-heading text-lg font-bold text-primary-foreground">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 className="truncate font-heading text-xl font-bold tracking-tight">
          {user.name}
        </h2>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        <span className="inline-flex w-fit items-center rounded-full border border-brand/25 bg-background/70 px-2.5 py-0.5 font-mono text-[0.6875rem] font-semibold tracking-[0.12em] text-brand uppercase">
          {ROLE_LABELS[user.role]}
        </span>
      </div>
    </section>
  );
}

async function CompanyPanelLoader() {
  // independent reads, issued together to halve the render wait
  const [company, dashboard] = await Promise.all([
    companyService.get(),
    companyService.dashboard(),
  ]);

  return <CompanyPanel company={company} dashboard={dashboard} />;
}

export default async function ProfilePage() {
  const user = await authService.requireUser();

  if (!user) return null; // layout handles redirect

  const showCandidateTab = user.role === "CANDIDATE";
  const showRecruiterTab = user.role === "RECRUITER";
  const identityUser = {
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };

  return (
    <>
      <DashboardPageHeader
        description="Manage how you appear across CodeArena."
        title="Profile"
      />

      <AccountSummary
        user={{
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        }}
      />

      {showCandidateTab || showRecruiterTab ? (
        <Tabs defaultValue="identity" className="w-full">
          <TabsList>
            <TabsTrigger value="identity">Identity</TabsTrigger>
            {showCandidateTab ? (
              <TabsTrigger value="candidate">Candidate profile</TabsTrigger>
            ) : null}
            {showRecruiterTab ? (
              <TabsTrigger value="company">Company</TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="identity">
            <DashboardPanel title="Identity">
              <IdentityForm user={identityUser} />
            </DashboardPanel>
          </TabsContent>

          {showCandidateTab ? (
            <TabsContent value="candidate">
              <DashboardPanel
                description="These fields only appear on your candidate profile. They are not visible to other companies."
                title="Candidate profile"
              >
                <CandidateProfileForm
                  user={{
                    phone: user.phone,
                    bio: user.bio,
                    skills: user.skills,
                    resumeUrl: user.resumeUrl,
                    githubUrl: user.githubUrl,
                  }}
                />
              </DashboardPanel>
            </TabsContent>
          ) : null}

          {showRecruiterTab ? (
            <TabsContent value="company">
              <DashboardPanel
                description="Managed via your company profile. Credits are topped up by settled payments."
                title="Company"
              >
                <Suspense fallback={<Spinner />}>
                  <CompanyPanelLoader />
                </Suspense>
              </DashboardPanel>
            </TabsContent>
          ) : null}
        </Tabs>
      ) : (
        <DashboardPanel title="Identity">
          <IdentityForm user={identityUser} />
        </DashboardPanel>
      )}
    </>
  );
}
