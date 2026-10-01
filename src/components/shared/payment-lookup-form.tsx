"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { InlineNotice } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PaymentLookupForm({
  defaultValue,
  error,
}: {
  defaultValue: string;
  error: string | null;
}) {
  const locked = defaultValue.length > 0;

  return (
    <form
      action="/dashboard/admin/payments/lookup"
      className="flex flex-col gap-3"
      method="get"
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label
            className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
            htmlFor="payment-id"
          >
            Payment ID
          </label>
          <Input
            autoComplete="off"
            defaultValue={defaultValue}
            id="payment-id"
            name="id"
            placeholder="Full payment identifier"
            readOnly={locked}
            required
            spellCheck={false}
          />
        </div>

        {locked ? (
          <Button
            render={<Link href="/dashboard/admin/payments/lookup" />}
            size="sm"
            variant="outline"
          >
            Edit ID
          </Button>
        ) : (
          <Button size="sm" type="submit">
            <SearchIcon className="size-3.5" />
            Look up
          </Button>
        )}
      </div>

      {error ? (
        <InlineNotice body={error} title="Lookup failed" tone="danger" />
      ) : null}
    </form>
  );
}
