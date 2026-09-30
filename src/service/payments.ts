import { api } from "@/lib/api";
import type {
  ApiResponse,
  InitiatePaymentResult,
  Paginated,
  Payment,
  PaymentDetail,
} from "@/lib/types";

export const paymentService = {
  initiate: (
    plan: "STARTER" | "PRO" | "ENTERPRISE",
  ): Promise<ApiResponse<InitiatePaymentResult>> =>
    api("/payments/initiate", { method: "POST", body: { plan } }),

  history: (page = 1, limit = 10): Promise<ApiResponse<Paginated<Payment>>> =>
    api(`/payments?page=${page}&limit=${limit}`, { tags: ["payments"] }),

  detail: (id: string): Promise<ApiResponse<PaymentDetail>> =>
    api(`/payments/${id}`),
};
