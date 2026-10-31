import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    where: { status: "open" },
    include: {
      reporter: { select: { name: true } },
      thread: { select: { id: true, title: true, authorId: true } },
      reply: { select: { id: true, body: true, threadId: true, authorId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}
