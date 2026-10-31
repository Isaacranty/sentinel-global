import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitFlag } from "@/lib/orchestrator";

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

  const body = await req.json();
  const guess = typeof body.flag === "string" ? body.flag : "";

  // Flags are 128 bits of randomness, so brute force isn't practical
  // even without rate limiting — but if this ever backs a scored
  // competition, add a per-instance attempt cap here.
  const result = await submitFlag(params.id, guess);
  return NextResponse.json(result);
}
