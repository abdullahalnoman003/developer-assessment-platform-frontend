import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}

export function Section({
  className,
  id,
  children,
}: {
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("py-14 sm:py-20 lg:py-24", className)} id={id}>
      {children}
    </section>
  );
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-soft px-3 py-1 font-mono text-[0.6875rem] font-semibold tracking-[0.16em] text-brand uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl animate-fade-up flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base/relaxed text-muted-foreground text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border/70 bg-muted/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-mesh-brand opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
      />

      <Container className="relative flex animate-fade-up flex-col items-start gap-5 py-14 sm:py-20 lg:py-24">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="max-w-3xl font-heading text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl lg:text-5xl xl:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-lg/relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
        {children}
      </Container>
    </div>
  );
}
