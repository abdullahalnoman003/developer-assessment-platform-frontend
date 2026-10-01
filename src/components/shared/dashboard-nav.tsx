"use client";

import {
  ClipboardCheckIcon,
  FileQuestionIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MailIcon,
  ReceiptIcon,
  ScrollTextIcon,
  SettingsIcon,
  TrophyIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  type DashboardIconName,
  type DashboardNavConfig,
  isNavItemActive,
} from "@/lib/dashboard-nav";

const ICONS: Record<DashboardIconName, LucideIcon> = {
  assessments: ClipboardCheckIcon,
  audit: ScrollTextIcon,
  billing: ReceiptIcon,
  invitations: MailIcon,
  overview: LayoutDashboardIcon,
  profile: UserCogIcon,
  questions: FileQuestionIcon,
  results: TrophyIcon,
  settings: SettingsIcon,
  users: UsersIcon,
};

export function DashboardNav({ config }: { config: DashboardNavConfig }) {
  const pathname = usePathname();

  return (
    <SidebarContent>
      {config.groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isNavItemActive(pathname, item.href, item.end);
                const Icon = ICONS[item.icon];
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      aria-current={active ? "page" : undefined}
                      isActive={active}
                      render={<Link href={item.href} />}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
