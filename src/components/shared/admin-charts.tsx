"use client";

import { BarChart3Icon, PieChartIcon } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CHART_COLORS } from "@/lib/dashboard-nav";
import type { AdminStats } from "@/lib/types";

const ROLE_CONFIG = {
  candidates: { label: "Candidates", color: CHART_COLORS[0] },
  recruiters: { label: "Recruiters", color: CHART_COLORS[1] },
  admins: { label: "Admins", color: CHART_COLORS[2] },
} satisfies ChartConfig;

const CONTENT_CONFIG = {
  questions: { label: "Questions", color: CHART_COLORS[0] },
  assessments: { label: "Assessments", color: CHART_COLORS[1] },
  attempts: { label: "Attempts", color: CHART_COLORS[2] },
  companies: { label: "Companies", color: CHART_COLORS[3] },
} satisfies ChartConfig;

export function UsersByRoleChart({ stats }: { stats: AdminStats }) {
  const data = [
    { key: "candidates", label: "Candidates", value: stats.users.candidates },
    { key: "recruiters", label: "Recruiters", value: stats.users.recruiters },
    { key: "admins", label: "Admins", value: stats.users.admins },
  ].filter((entry) => entry.value > 0);

  if (data.length === 0) {
    return (
      <EmptyChart
        Icon={PieChartIcon}
        message="No accounts are registered yet."
      />
    );
  }

  return (
    <div
      aria-label={describeData(data, "Registered accounts by role")}
      role="img"
    >
      <ChartContainer
        className="mx-auto aspect-square max-h-64 w-full"
        config={ROLE_CONFIG}
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" innerRadius={44} nameKey="label">
            {data.map((entry, index) => (
              <Cell
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                key={entry.key}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

function describeData(
  data: readonly { label: string; value: number }[],
  subject: string,
): string {
  return `${subject}: ${data
    .map((entry) => `${entry.label} ${entry.value}`)
    .join(", ")}.`;
}

export function ContentVolumeChart({ stats }: { stats: AdminStats }) {
  const data = [
    { key: "questions", label: "Questions", value: stats.questions },
    { key: "assessments", label: "Assessments", value: stats.assessments },
    { key: "attempts", label: "Attempts", value: stats.attempts },
    { key: "companies", label: "Companies", value: stats.companies },
  ];

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  if (total === 0) {
    return (
      <EmptyChart
        Icon={BarChart3Icon}
        message="Recruiters have not created content yet."
      />
    );
  }

  return (
    <div aria-label={describeData(data, "Total content created")} role="img">
      <ChartContainer
        className="aspect-auto h-56 w-full"
        config={CONTENT_CONFIG}
      >
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <XAxis type="number" hide />
          <YAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            tickMargin={8}
            type="category"
            width={92}
          />
          <Bar dataKey="value" radius={2}>
            {data.map((entry, index) => (
              <Cell
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                key={entry.key}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function EmptyChart({
  Icon,
  message,
}: {
  Icon: typeof PieChartIcon;
  message: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-6 text-center">
      <Icon aria-hidden className="size-5 text-muted-foreground" />
      <p className="text-sm/relaxed text-muted-foreground">{message}</p>
    </div>
  );
}
