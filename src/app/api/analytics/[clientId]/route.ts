import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId: agency.id, isActive: true },
      select: { id: true, businessName: true, niche: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: { clientId, client: { agencyId: agency.id } },
      select: {
        status: true,
        contentPillar: true,
        postType: true,
        createdAt: true,
      },
    });

    // By status
    const byStatus: Record<string, number> = {};
    posts.forEach((p) => {
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    });

    // By pillar
    const byPillarMap: Record<string, number> = {};
    posts.forEach((p) => {
      const key = p.contentPillar ?? "Uncategorized";
      byPillarMap[key] = (byPillarMap[key] ?? 0) + 1;
    });
    const byPillar = Object.entries(byPillarMap).sort((a, b) => b[1] - a[1]);

    // By post type
    const byTypeMap: Record<string, number> = {};
    posts.forEach((p) => {
      byTypeMap[p.postType] = (byTypeMap[p.postType] ?? 0) + 1;
    });
    const byType = Object.entries(byTypeMap).sort((a, b) => b[1] - a[1]);

    // Last 3 months
    const now = new Date();
    const byMonth = [2, 1, 0].map((i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1;
      const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      const monthPosts = posts.filter((p) => {
        const pd = new Date(p.createdAt);
        return pd.getFullYear() === yr && pd.getMonth() + 1 === mo;
      });
      return {
        label,
        total: monthPosts.length,
        posted: monthPosts.filter((p) => p.status === "POSTED").length,
        approved: monthPosts.filter((p) => p.status === "APPROVED").length,
        rejected: monthPosts.filter((p) => p.status === "REJECTED").length,
      };
    });

    const total = posts.length;
    const posted = byStatus["POSTED"] ?? 0;
    const approved = byStatus["APPROVED"] ?? 0;
    const rejected = byStatus["REJECTED"] ?? 0;
    const approvalRate =
      approved + rejected > 0
        ? Math.round((approved + posted) / (approved + posted + rejected) * 100)
        : 0;

    return NextResponse.json({
      client,
      total,
      posted,
      approved,
      rejected,
      draft: byStatus["DRAFT"] ?? 0,
      approvalRate,
      byStatus,
      byPillar,
      byType,
      byMonth,
    });
  } catch (error) {
    console.error("GET /api/analytics/[clientId] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
