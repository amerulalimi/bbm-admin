import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalJobs, publishedJobs, draftJobs, closedJobs] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({
        where: { jobStatus: "published" },
      }),
      prisma.job.count({ where: { jobStatus: "draft" } }),
      prisma.job.count({ where: { jobStatus: "closed" } }),
    ]);

    return NextResponse.json({
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
