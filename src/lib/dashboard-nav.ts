import type { Role } from "@/lib/types";

export type DashboardIconName =
  | "assessments"
  | "billing"
  | "invitations"
  | "overview"
  | "profile"
  | "questions"
  | "results"
  | "settings"
  | "audit"
  | "users";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: DashboardIconName;
  end?: boolean;
}

export interface DashboardNavGroup {
  label: string;
  items: readonly DashboardNavItem[];
}

export interface DashboardNavConfig {
  home: string;
  homeLabel: string;
  groups: readonly DashboardNavGroup[];
}

const ADMIN_NAV: DashboardNavConfig = {
  home: "/dashboard/admin",
  homeLabel: "Overview",
  groups: [
    {
      label: "Platform",
      items: [
        {
          href: "/dashboard/admin",
          label: "Overview",
          icon: "overview",
          end: true,
        },
        { href: "/dashboard/admin/users", label: "Users", icon: "users" },
        {
          href: "/dashboard/admin/audit-logs",
          label: "Audit logs",
          icon: "audit",
        },
      ],
    },
    {
      label: "Finance",
      items: [
        {
          href: "/dashboard/admin/payments/lookup",
          label: "Payment lookup",
          icon: "billing",
        },
      ],
    },
    {
      label: "Account",
      items: [{ href: "/profile", label: "Profile", icon: "profile" }],
    },
  ],
};

const RECRUITER_NAV: DashboardNavConfig = {
  home: "/dashboard/recruiter",
  homeLabel: "Overview",
  groups: [
    {
      label: "Hiring",
      items: [
        {
          href: "/dashboard/recruiter",
          label: "Overview",
          icon: "overview",
          end: true,
        },
        {
          href: "/dashboard/recruiter/questions",
          label: "Questions",
          icon: "questions",
        },
        {
          href: "/dashboard/recruiter/assessments",
          label: "Assessments",
          icon: "assessments",
        },
        {
          href: "/dashboard/recruiter/company",
          label: "Company",
          icon: "settings",
        },
      ],
    },
    {
      label: "Billing",
      items: [
        {
          href: "/dashboard/recruiter/billing",
          label: "Credits & payments",
          icon: "billing",
        },
      ],
    },
    {
      label: "Account",
      items: [{ href: "/profile", label: "Profile", icon: "profile" }],
    },
  ],
};

const CANDIDATE_NAV: DashboardNavConfig = {
  home: "/dashboard/candidate",
  homeLabel: "Overview",
  groups: [
    {
      label: "Assessment",
      items: [
        {
          href: "/dashboard/candidate",
          label: "Overview",
          icon: "overview",
          end: true,
        },
        {
          href: "/dashboard/candidate/invitations",
          label: "Invitations",
          icon: "invitations",
        },
        {
          href: "/dashboard/candidate/results",
          label: "Results",
          icon: "results",
        },
      ],
    },
    {
      label: "Account",
      items: [{ href: "/profile", label: "Profile", icon: "profile" }],
    },
  ],
};

const NAV_BY_ROLE: Record<Role, DashboardNavConfig> = {
  ADMIN: ADMIN_NAV,
  RECRUITER: RECRUITER_NAV,
  CANDIDATE: CANDIDATE_NAV,
};

export function dashboardNavFor(role: Role): DashboardNavConfig {
  return NAV_BY_ROLE[role];
}

export function isNavItemActive(
  pathname: string,
  href: string,
  end?: boolean,
): boolean {
  if (end) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;
