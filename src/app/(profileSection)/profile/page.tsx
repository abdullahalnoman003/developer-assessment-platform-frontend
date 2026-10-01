import type { Metadata } from "next";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Profile");

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <main>
      <h1>Profile</h1>
      <p>
        TODO: role-aware tabs - Identity for all, Candidate profile fields,
        Recruiter company form plus credits panel.
      </p>
    </main>
  );
}
