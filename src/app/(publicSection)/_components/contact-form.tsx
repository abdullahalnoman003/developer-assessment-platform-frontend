"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, MailIcon, TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { type ContactInput, contactSchema } from "@/lib/validations";

const TOPIC_OPTIONS = [
  {
    value: "GENERAL",
    label: "General question",
    description: "Anything that does not fit the other three",
  },
  {
    value: "SALES",
    label: "Pricing or credits",
    description: "Credit packs, billing, company plans",
  },
  {
    value: "SUPPORT",
    label: "Support",
    description: "Something is broken or behaving oddly",
  },
  {
    value: "BUG",
    label: "Bug report",
    description: "A reproducible problem, with steps",
  },
] as const;

const TOPIC_LABELS = {
  GENERAL: "General question",
  SALES: "Pricing or credits",
  SUPPORT: "Support",
  BUG: "Bug report",
} as const satisfies Record<ContactInput["topic"], string>;

export function ContactForm() {
  const [opened, setOpened] = useState(false);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: "GENERAL", message: "" },
  });

  const { handleSubmit, register, watch, setValue, formState } = form;
  const selectedTopic = watch("topic");
  const messageLength = watch("message")?.length ?? 0;

  const onSubmit = handleSubmit((values) => {
    const subject = `[CodeArena] ${TOPIC_LABELS[values.topic]}`;
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Topic: ${TOPIC_LABELS[values.topic]}`,
      "",
      values.message,
    ].join("\n");

    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    setOpened(true);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Send a message</CardTitle>
        <p className="text-sm/relaxed text-muted-foreground">
          This form validates what you type and then hands the message to your
          own email client. Nothing is stored on a server, so nothing is sent
          until you press send in that window.
        </p>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
          {opened ? (
            <output className="flex items-start gap-2 border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-2 text-sm">
              <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-accent-cyan" />
              <span>
                Your email client should now be open with the message
                pre-filled. If nothing happened, email{" "}
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${SUPPORT_EMAIL}`}
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                directly and paste the text in.
              </span>
            </output>
          ) : null}

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(formState.errors.name)}>
                <FieldLabel htmlFor="contact-name">Your name</FieldLabel>
                <Input
                  autoComplete="name"
                  id="contact-name"
                  placeholder="Ada Lovelace"
                  {...register("name")}
                />
                <FieldError
                  errors={[{ message: formState.errors.name?.message }]}
                />
              </Field>

              <Field data-invalid={Boolean(formState.errors.email)}>
                <FieldLabel htmlFor="contact-email">Your email</FieldLabel>
                <Input
                  autoComplete="email"
                  id="contact-email"
                  inputMode="email"
                  placeholder="you@company.com"
                  type="email"
                  {...register("email")}
                />
                <FieldError
                  errors={[{ message: formState.errors.email?.message }]}
                />
              </Field>
            </div>

            <FieldSet>
              <FieldLegend variant="label">What is this about?</FieldLegend>
              <div className="grid gap-2 sm:grid-cols-2">
                {TOPIC_OPTIONS.map((option) => {
                  const active = selectedTopic === option.value;
                  return (
                    <label
                      className="flex cursor-pointer items-start gap-2.5 border border-border bg-background p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
                      key={option.value}
                    >
                      <input
                        checked={active}
                        className="mt-1 size-3.5 shrink-0 accent-primary"
                        name="contact-topic"
                        onChange={() => setValue("topic", option.value)}
                        type="radio"
                        value={option.value}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="font-heading text-xs">
                          {option.label}
                        </span>
                        <span className="text-[11px] leading-snug text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </FieldSet>

            <Field data-invalid={Boolean(formState.errors.message)}>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea
                className="min-h-40 resize-y"
                id="contact-message"
                placeholder="At least 20 characters. Include steps and expected behaviour if something is broken."
                {...register("message")}
              />
              <FieldDescription className="flex items-center justify-between gap-2">
                <span>
                  {formState.errors.message?.message ?? "Plain text is fine."}
                </span>
                <span className="shrink-0 tabular-nums">
                  {messageLength}/2000
                </span>
              </FieldDescription>
            </Field>

            <Button size="lg" type="submit">
              <MailIcon data-icon="inline-start" />
              Open in my email client
            </Button>

            {Object.keys(formState.errors).length > 0 ? (
              <p
                className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                Fix the highlighted fields and try again.
              </p>
            ) : null}
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
