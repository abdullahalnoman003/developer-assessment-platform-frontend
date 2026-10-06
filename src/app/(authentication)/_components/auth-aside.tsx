import {
  ClipboardCheckIcon,
  LayersIcon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const HIGHLIGHTS = [
  {
    Icon: LayersIcon,
    title: "Build a reusable question bank",
    body: "Multiple choice, written and coding prompts with difficulty tags, ready to drop into any assessment.",
  },
  {
    Icon: SendIcon,
    title: "Invite and track every candidate",
    body: "Credits, deadlines and attempt status sit in one timeline, so nothing gets lost between rounds.",
  },
  {
    Icon: ClipboardCheckIcon,
    title: "Grade with structure",
    body: "Score written and coding answers side by side, add feedback and release results when you are ready.",
  },
] as const;

const FLOW = [
  "Create",
  "Publish",
  "Invite",
  "Attempt",
  "Grade",
  "Release",
] as const;

export function AuthAside() {
  return (
    <aside className="hidden animate-rise md:flex md:flex-col md:justify-center">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/25 bg-brand-soft px-3 py-1 font-mono text-[0.6875rem] font-semibold tracking-[0.16em] text-brand uppercase">
            <SparklesIcon className="size-3.5" />
            The hiring loop, in one place
          </p>
          <p className="font-heading text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl xl:text-5xl">
            Screen, invite, grade and{" "}
            <span className="text-gradient-brand">decide</span> without leaving
            the tab.
          </p>
          <p className="max-w-lg text-base/relaxed text-muted-foreground text-pretty">
            {APP_NAME} keeps your question bank, candidates and evaluation
            history connected, so every hiring round starts from the last one
            instead of a blank page.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {HIGHLIGHTS.map(({ Icon, title, body }) => (
            <li className="flex items-start gap-4" key={title}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                <Icon className="size-5" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-heading text-sm font-bold tracking-tight">
                  {title}
                </span>
                <span className="text-sm/relaxed text-muted-foreground">
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-border/70 pt-6">
          {FLOW.map((step, index) => (
            <span className="flex items-center gap-2" key={step}>
              <span className="rounded-md border border-border/70 bg-background/70 px-2 py-1 font-mono text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {step}
              </span>
              {index < FLOW.length - 1 ? (
                <span aria-hidden className="text-brand/50">
                  ·
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
