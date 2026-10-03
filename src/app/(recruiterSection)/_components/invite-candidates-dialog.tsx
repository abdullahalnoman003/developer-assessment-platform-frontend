"use client";

import { SendIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { inviteCandidatesAction } from "@/app/(recruiterSection)/_actions/recruiter";
import { InlineNotice } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";

function parseEmailList(raw: string): {
  emails: string[];
  invalid: string[];
  duplicates: string[];
} {
  const seen = new Set<string>();
  const emails: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];

  for (const line of raw.split(/[\n,;]+/)) {
    const value = line.trim().toLowerCase();
    if (value === "") continue;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      invalid.push(line.trim());
      continue;
    }
    if (seen.has(value)) {
      duplicates.push(value);
      continue;
    }
    seen.add(value);
    emails.push(value);
  }

  return { emails, invalid, duplicates };
}

function SendButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={disabled || pending} type="submit">
      {pending ? <Spinner className="size-3.5" /> : null}
      {pending ? "Sending" : "Send invitations"}
    </Button>
  );
}

export function InviteCandidatesDialog({
  assessmentId,
  remainingCredits,
  alreadyInvited,
}: {
  assessmentId: string;
  remainingCredits: number;
  alreadyInvited: number;
}) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [state, formAction] = useActionState<ActionState, FormData>(
    inviteCandidatesAction,
    IDLE_ACTION_STATE,
  );
  const router = useRouter();

  const parsed = parseEmailList(raw);
  const atCap = parsed.emails.length > 100;
  // credits left minus invites already sent, so the button fails before the API does
  const outOfCredits = parsed.emails.length > remainingCredits;
  const blocked = parsed.emails.length === 0 || atCap || outOfCredits;

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
      setRaw("");
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button size="sm">
            <SendIcon className="size-3.5" />
            Invite candidates
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">
            Invite candidates
          </DialogTitle>
          <DialogDescription>
            One invitation per address, up to 100 at a time. Each accepted
            address costs 1 credit and the candidate must already have a
            candidate account — the API does not create one.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input name="assessmentId" type="hidden" value={assessmentId} />
          <input
            name="candidateEmails"
            type="hidden"
            value={JSON.stringify(parsed.emails)}
          />

          <FieldGroup>
            <Field data-invalid={Boolean(parsed.invalid.length)}>
              <FieldLabel htmlFor="invite-emails">Email addresses</FieldLabel>
              <Textarea
                id="invite-emails"
                onChange={(event) => setRaw(event.target.value)}
                placeholder={"ada@example.com\ngrace@example.com"}
                rows={7}
                value={raw}
              />
              <FieldDescription>
                {parsed.emails.length} valid · roughly {remainingCredits} credit
                {remainingCredits === 1 ? "" : "s"} available — the balance
                minus all {alreadyInvited} invitation
                {alreadyInvited === 1 ? "" : "s"} ever sent
              </FieldDescription>
              <FieldError
                errors={
                  parsed.invalid.length > 0
                    ? [
                        {
                          message: `Not an email address: ${parsed.invalid.slice(0, 3).join(", ")}`,
                        },
                      ]
                    : []
                }
              />
            </Field>
          </FieldGroup>

          {parsed.duplicates.length > 0 ? (
            <InlineNotice
              body={`Repeated addresses were dropped: ${parsed.duplicates.slice(0, 3).join(", ")}`}
              title="Duplicates removed"
              tone="info"
            />
          ) : null}

          {atCap ? (
            <InlineNotice
              body="The API accepts at most 100 addresses per request. Send the rest in a second batch."
              title="Too many addresses"
              tone="warning"
            />
          ) : null}

          {outOfCredits ? (
            <InlineNotice
              body={`You have ${remainingCredits} credit${remainingCredits === 1 ? "" : "s"} but entered ${parsed.emails.length} addresses. The whole request is rejected if the balance is short.`}
              title="Not enough credits"
              tone="warning"
            />
          ) : null}

          {state.status === "error" ? (
            <InlineNotice
              body={state.message}
              title="Invitations were not sent"
              tone="danger"
            />
          ) : null}

          <p className="border-t border-border pt-3 text-xs/relaxed text-muted-foreground">
            Invitations expire after 7 days. They only appear in the results
            table once the candidate actually starts the assessment, so a quiet
            table does not necessarily mean nothing was sent.
          </p>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <SendButton disabled={blocked} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
