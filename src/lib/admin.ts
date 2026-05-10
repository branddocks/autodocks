/**
 * Super-admin configuration.
 * branddocks@gmail.com has unrestricted access to all agency data
 * and the /admin control panel.
 */

export const ADMIN_EMAIL = "branddocks@gmail.com";

export function isAdmin(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL;
}
