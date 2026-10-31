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

  if (params.id === session.user.id) {
    return NextResponse.json({ error: "you can't ban yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }
  if (target.role === "admin") {
    return NextResponse.json({ error: "can't ban another admin" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 300) : null;

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: target.banned
      ? { banned: false, bannedReason: null, bannedAt: null }
      : { banned: true, bannedReason: reason, bannedAt: new Date() },
  });

  return NextResponse.json({ banned: updated.banned });
}
