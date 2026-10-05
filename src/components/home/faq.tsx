"use client";

import { FAQ, FAQ_GROUPS, type FaqEntry } from "@/components/home/faq-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function FaqGroup({
  group,
  entries,
  idPrefix,
  showLabel,
}: {
  group: FaqEntry["group"];
  entries: readonly FaqEntry[];
  idPrefix: string;
  showLabel: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {showLabel ? (
        <h2 className="font-heading text-xs font-bold tracking-[0.14em] text-brand uppercase">
          {group}
        </h2>
      ) : null}
      <Accordion className="gap-3">
        {entries.map((entry, index) => (
          <AccordionItem
            className="rounded-xl border border-border/80 bg-card px-5 shadow-sm transition-colors data-open:border-brand/40 data-open:bg-brand-soft-gradient"
            key={entry.question}
            value={`${idPrefix}-${index}`}
          >
            <AccordionTrigger className="font-heading text-base font-semibold">
              {entry.question}
            </AccordionTrigger>
            <AccordionContent
              className="text-sm/relaxed text-muted-foreground"
              keepMounted
            >
              {entry.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function Faq({ limit }: { limit?: number }) {
  const entries = limit ? FAQ.slice(0, limit) : FAQ;
  const groups = limit
    ? [...new Set(entries.map((entry) => entry.group))]
    : [...FAQ_GROUPS];

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <FaqGroup
          entries={entries.filter((entry) => entry.group === group)}
          group={group}
          idPrefix={limit ? "preview" : "faq"}
          key={group}
          showLabel={!limit}
        />
      ))}
    </div>
  );
}
