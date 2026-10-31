import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const instance = await prisma.challengeInstance.findUnique({ where: { id: params.id } });

  if (!instance || instance.userId !== session.user.id) {
    // Same response for "not found" and "not yours" — don't leak
    // which instance IDs exist to someone probing at random.
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const secondsRemaining = Math.max(
    0,
    Math.round((instance.expiresAt.getTime() - Date.now()) / 1000)
  );

  const [unlockedHints, userProfile] = await Promise.all([
    prisma.hintUnlock.findMany({
      where: { userId: session.user.id, challengeId: instance.challengeId },
      select: { hintId: true }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { spentXp: true }
    })
  ]);

  // Recalculate XP for frontend (simpler to just pass it here)
  const solvedCount = await prisma.challengeInstance.count({ where: { userId: session.user.id, status: "solved" } });
  const progressCount = await prisma.resourceProgress.count({ where: { userId: session.user.id } });
  const verifiedCount = await prisma.thread.count({ where: { authorId: session.user.id, verified: true } });
  const xp = (solvedCount * 100) + (progressCount * 25) + (verifiedCount * 150) - (userProfile?.spentXp || 0);

  return NextResponse.json({
    instance: {
      id: instance.id,
      status: instance.status,
      secondsRemaining,
      unlockedHints: unlockedHints.map(h => h.hintId),
      currentXp: xp
    },
  });
}
