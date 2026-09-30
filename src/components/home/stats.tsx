import { Container } from "@/components/home/page-hero";
import {
  ATTEMPT_STATUS_LABELS,
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
} from "@/lib/constants";

const FACTS = [
  {
    value: String(Object.keys(QUESTION_TYPE_LABELS).length),
    unit: "question types",
    note: Object.values(QUESTION_TYPE_LABELS).join(" · "),
  },
  {
    value: String(Object.keys(DIFFICULTY_LABELS).length),
    unit: "difficulty levels",
    note: Object.values(DIFFICULTY_LABELS).join(" · "),
  },
  {
    value: String(Object.keys(ATTEMPT_STATUS_LABELS).length),
    unit: "attempt states",
    note: "From not started to evaluated",
  },
  {
    value: "3",
    unit: "fixed roles",
    note: "Candidate · Recruiter · Admin",
  },
] as const;

export function Stats() {
  return (
    <div className="border-y border-border bg-muted/30">
      <Container>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact) => (
            <div
              className="flex flex-col gap-1 border-border px-1 py-8 sm:border-r sm:last:border-r-0 lg:px-6"
              key={fact.unit}
            >
              <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {fact.unit}
              </dt>
              <dd className="flex flex-col gap-1">
                <span className="font-heading text-3xl font-semibold text-gradient-brand">
                  {fact.value}
                </span>
                <span className="text-xs/relaxed text-muted-foreground">
                  {fact.note}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
