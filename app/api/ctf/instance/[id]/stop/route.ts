import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stopInstance } from "@/lib/orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const instance = await prisma.challengeInstance.findUnique({ where: { id: params.id } });
  if (!instance || instance.userId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const updated = await stopInstance(params.id);
  return NextResponse.json({ instance: { id: updated?.id, status: updated?.status } });
}
