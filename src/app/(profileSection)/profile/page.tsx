import type { Metadata } from "next";
import { Suspense } from "react";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardMetadata } from "@/lib/seo";
import { authService } from "@/service/auth";
import { CandidateProfileForm } from "../_components/candidate-form";
import { CompanyPanel } from "../_components/company-panel";
import { IdentityForm } from "../_components/identity-form";

export const metadata: Metadata = dashboardMetadata("Profile");

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await authService.requireUser();

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
        description={`Signed in as ${user.email}`}
        title="Profile"
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
                  <CompanyPanel />
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
