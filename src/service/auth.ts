import { api } from "@/lib/api";
import type { ApiResponse, AuthTokens, SessionUser, User } from "@/lib/types";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "@/lib/validations";

function fetchMe(token?: string): Promise<ApiResponse<SessionUser>> {
  return token ? api("/auth/me", { token }) : api("/auth/me");
}

export const authService = {
  register: (payload: RegisterInput): Promise<ApiResponse<User>> =>
    api("/auth/register", { method: "POST", body: payload }),

  login: (payload: LoginInput): Promise<ApiResponse<AuthTokens>> =>
    api("/auth/login", { method: "POST", body: payload }),

  google: (
    idToken: string,
    role?: "CANDIDATE" | "RECRUITER",
  ): Promise<ApiResponse<AuthTokens>> =>
    api("/auth/google", {
      method: "POST",
      body: role ? { idToken, role } : { idToken },
    }),

  forgotPassword: (payload: ForgotPasswordInput): Promise<ApiResponse<null>> =>
    api("/auth/forgot-password", { method: "POST", body: payload }),

  resetPassword: (payload: {
    token: string;
    password: string;
  }): Promise<ApiResponse<null>> =>
    api("/auth/reset-password", { method: "POST", body: payload }),

  updateProfile: (payload: UpdateProfileInput): Promise<ApiResponse<User>> =>
    api("/users/me", { method: "PATCH", body: payload }),

  currentUser: async (token?: string): Promise<SessionUser | null> => {
    try {
      const res = await fetchMe(token);
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  },

  requireUser: async (): Promise<SessionUser | null> => {
    return authService.currentUser();
  },
};
