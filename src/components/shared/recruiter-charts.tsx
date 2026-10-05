"use client";

import { BarChart3Icon, PieChartIcon } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ASSESSMENT_STATUS_LABELS,
  ATTEMPT_STATUS_LABELS,
} from "@/lib/constants";
import { CHART_COLORS } from "@/lib/dashboard-nav";
import type {
  AssessmentStatus,
  AttemptStatus,
  CompanyDashboard,
} from "@/lib/types";

const FUNNEL_CONFIG = {
  draft: { label: "Draft", color: CHART_COLORS[0] },
  published: { label: "Published", color: CHART_COLORS[1] },
  closed: { label: "Closed", color: CHART_COLORS[2] },
  archived: { label: "Archived", color: CHART_COLORS[3] },
} satisfies ChartConfig;

const ATTEMPT_CONFIG = {
  not_started: { label: "Not started", color: CHART_COLORS[0] },
  in_progress: { label: "In progress", color: CHART_COLORS[1] },
  submitted: { label: "Submitted", color: CHART_COLORS[2] },
  evaluated: { label: "Evaluated", color: CHART_COLORS[3] },
  expired: { label: "Expired", color: CHART_COLORS[4] },
} satisfies ChartConfig;

const FUNNEL_ORDER: readonly AssessmentStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
];

export function AssessmentFunnelChart({ stats }: { stats: CompanyDashboard }) {
  const data = FUNNEL_ORDER.map((status) => ({
    key: status,
    label: ASSESSMENT_STATUS_LABELS[status],
    value: stats.assessmentsByStatus[status] ?? 0,
  })).filter((entry) => entry.value > 0);

  if (data.length === 0) {
    return (
      <EmptyChart
        Icon={BarChart3Icon}
        message="No assessments yet. Create one to start tracking it here."
      />
    );
  }

  return (
    // Recharts draws raw SVG with no text, so the numbers are spoken here
    <div aria-label={describeData(data, "Assessments by status")} role="img">
      <ChartContainer
        className="aspect-auto h-56 w-full"
        config={FUNNEL_CONFIG}
      >
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <XAxis hide type="number" />
          <YAxis
            axisLine={false}
            dataKey="label"
            tickLine={false}
            tickMargin={8}
            type="category"
            width={78}
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

function describeData(
  data: readonly { label: string; value: number }[],
  subject: string,
): string {
  return `${subject}: ${data
    .map((entry) => `${entry.label} ${entry.value}`)
    .join(", ")}.`;
}

const ATTEMPT_ORDER: readonly AttemptStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "EVALUATED",
  "EXPIRED",
];

export function AttemptsDonutChart({ stats }: { stats: CompanyDashboard }) {
  const data = ATTEMPT_ORDER.map((status) => ({
    key: status,
    label: ATTEMPT_STATUS_LABELS[status],
    value: stats.attemptsByStatus[status] ?? 0,
  })).filter((entry) => entry.value > 0);

  if (data.length === 0) {
    return (
      <EmptyChart
        Icon={PieChartIcon}
        message="No candidate attempts yet. Publish an assessment and send an invitation to get one."
      />
    );
  }

  return (
    <div aria-label={describeData(data, "Attempts by status")} role="img">
      <ChartContainer
        className="mx-auto aspect-square max-h-64 w-full"
        config={ATTEMPT_CONFIG}
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
