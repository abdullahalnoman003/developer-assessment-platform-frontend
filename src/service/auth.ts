import { api, UnauthenticatedError } from "@/lib/api";
import type {
  ApiResponse,
  AuthTokens,
  ProfileUser,
  SessionUser,
} from "@/lib/types";
import type { LoginInput, RegisterInput } from "@/lib/validations";

/** `GET /auth/me` is the single source of truth for the signed-in user. */
function fetchMe(): Promise<ApiResponse<SessionUser>> {
  return api("/auth/me");
}

export const authService = {
  /** Tokens are returned in the body; callers must copy them into cookies. */
  register: (
    payload: RegisterInput,
  ): Promise<ApiResponse<{ user: ProfileUser; tokens: AuthTokens }>> =>
    api("/auth/register", { method: "POST", body: payload }),

  login: (
    payload: LoginInput,
  ): Promise<ApiResponse<{ user: ProfileUser; tokens: AuthTokens }>> =>
    api("/auth/login", { method: "POST", body: payload }),

  google: (
    credential: string,
    role: "CANDIDATE" | "RECRUITER",
  ): Promise<ApiResponse<{ user: ProfileUser; tokens: AuthTokens }>> =>
    api("/auth/google", { method: "POST", body: { credential, role } }),

  updateProfile: (payload: unknown): Promise<ApiResponse<ProfileUser>> =>
    api("/users/me", { method: "PATCH", body: payload }),

  /**
   * Resolves the signed-in user for Server Components.
   *
   * `api()` already rotates the session on a 401 and throws
   * `UnauthenticatedError` when the rotation fails, so a render only has to
   * decide between continuing as a guest (`null`) and bailing out.
   */
  currentUser: async (): Promise<SessionUser | null> => {
    try {
      const res = await fetchMe();
      return res.success ? res.data : null;
    } catch {
      return null;
    }
  },

  /** For Server Actions and handlers, where a missing session is fatal. */
  requireUser: async (): Promise<SessionUser> => {
    const user = await authService.currentUser();
    if (!user) throw new UnauthenticatedError();
    return user;
  },
};
