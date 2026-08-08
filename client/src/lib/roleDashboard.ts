export function getRoleDashboard(role: string | undefined | null): string {
  if (role === "officer") return "/office";
  if (role === "admin" || role === "super_admin") return "/admin";
  return "/dashboard";
}
