"use client";

import { ReceiptIcon } from "lucide-react";
import { useState } from "react";
import {
  PaymentProviderBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import type { Payment } from "@/lib/types";

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm break-all">{value}</dd>
    </div>
  );
}

export function PaymentReceiptDialog({ payment }: { payment: Payment }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button
            aria-label={`View receipt for ${payment.id}`}
            size="sm"
            variant="ghost"
          >
            <ReceiptIcon className="size-3.5" />
            Receipt
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">Receipt</DialogTitle>
          <DialogDescription>
            Read-only. The provider reference is the Stripe Checkout session id,
            which is what the success page matches on.
          </DialogDescription>
        </DialogHeader>

        <dl className="flex flex-col">
          <ReceiptRow label="Payment id" value={payment.id} />
          <ReceiptRow
            label="Status"
            value={PAYMENT_STATUS_LABELS[payment.status]}
          />
          <ReceiptRow
            label="Provider"
            value={PAYMENT_PROVIDER_LABELS[payment.provider]}
          />
          <ReceiptRow label="Amount" value={formatCurrency(payment.amount)} />
          <ReceiptRow
            label="Credits"
            value={formatNumber(payment.creditsGranted)}
          />
          <ReceiptRow
            label="Created"
            value={formatDateTime(payment.createdAt)}
          />
          <ReceiptRow
            label="Updated"
            value={formatDateTime(payment.updatedAt)}
          />
        </dl>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <PaymentStatusBadge value={payment.status} />
          <PaymentProviderBadge value={payment.provider} />
          <p className="text-xs/relaxed text-muted-foreground">
            Credits are granted by the provider webhook. This page never adjusts
            a balance itself.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
