import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { ControlShell } from "./ControlShell";

export default async function ControlLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/control/login");
  if (!isAdmin(session.user.email)) redirect("/dashboard");

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isSubdomain = host.startsWith("admin.");

  return (
    <ControlShell email={session.user.email} isSubdomain={isSubdomain}>
      {children}
    </ControlShell>
  );
}
