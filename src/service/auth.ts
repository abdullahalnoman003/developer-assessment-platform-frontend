import { api, UnauthenticatedError } from "@/lib/api";
import type { ApiResponse, AuthTokens, SessionUser, User } from "@/lib/types";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "@/lib/validations";

function fetchMe(): Promise<ApiResponse<SessionUser>> {
  return api("/auth/me");
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

  updateProfile: (payload: UpdateProfileInput): Promise<ApiResponse<User>> =>
    api("/users/me", { method: "PATCH", body: payload }),

  currentUser: async (): Promise<SessionUser | null> => {
    try {
      const res = await fetchMe();
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  },

  requireUser: async (): Promise<SessionUser> => {
    const user = await authService.currentUser();
    if (!user) throw new UnauthenticatedError();
    return user;
  },
};
