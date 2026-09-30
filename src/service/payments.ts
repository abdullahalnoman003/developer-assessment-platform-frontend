import { api, buildQuery } from "@/lib/api";
import type {
  ApiResponse,
  InitiatePaymentResult,
  Paginated,
  Payment,
  PaymentDetail,
} from "@/lib/types";
import type { InitiatePaymentInput } from "@/lib/validations";

export const paymentService = {
  initiate: (
    payload: InitiatePaymentInput,
  ): Promise<ApiResponse<InitiatePaymentResult>> =>
    api("/payments/initiate", { method: "POST", body: payload }),

  history: (page = 1, limit = 10): Promise<ApiResponse<Paginated<Payment>>> =>
    api(`/payments${buildQuery({ page, limit })}`, { tags: ["payments"] }),

  detail: (id: string): Promise<ApiResponse<PaymentDetail>> =>
    api(`/payments/${id}`),
};
