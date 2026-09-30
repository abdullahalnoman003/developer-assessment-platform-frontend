"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ, FAQ_GROUPS, type FaqEntry } from "@/components/home/faq-content";

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
    <div className="flex flex-col gap-3">
      {showLabel ? (
        <p className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {group}
        </p>
      ) : null}
      <Accordion className="border border-border bg-card px-4">
        {entries.map((entry, index) => (
          <AccordionItem key={entry.question} value={`${idPrefix}-${index}`}>
            <AccordionTrigger className="font-heading text-sm">
              {entry.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm/relaxed text-muted-foreground">
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
