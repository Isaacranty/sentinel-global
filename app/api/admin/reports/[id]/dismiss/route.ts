import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  try {
    await prisma.report.update({
      where: { id: params.id },
      data: { status: "dismissed" },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "report not found" }, { status: 404 });
  }
}
