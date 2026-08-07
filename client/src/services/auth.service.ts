import { apiClient } from "../api/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "officer" | "admin" | "super_admin";
};

export type AuthResult = {
  user: AuthUser;
  token: string;
};

export const authService = {
  register: (data: { name: string; email: string; password: string; role: string; phone?: string }) =>
    apiClient.post<AuthResult>("/auth/register", data),
  login: (data: { email: string; password: string }) => apiClient.post<AuthResult>("/auth/login", data),
  me: () => apiClient.get<AuthUser>("/auth/me"),
  logout: () => apiClient.post<null>("/auth/logout"),
};
