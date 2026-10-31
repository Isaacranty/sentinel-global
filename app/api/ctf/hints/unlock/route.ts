import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChallenge } from "@/lib/challenges";
import { getUserProfile } from "@/lib/userStore";

import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId, hintId } = await req.json();
  const config = getChallenge(challengeId);
  const hint = config?.hints?.[hintId];

  if (!hint) return NextResponse.json({ error: "Hint not found" }, { status: 404 });

  const profile = await getUserProfile(session.user.id);
  if (profile.xp < hint.cost) {
      return NextResponse.json({ error: "Insufficient XP" }, { status: 400 });
  }

  try {
    await prisma.$transaction([
        prisma.hintUnlock.create({
            data: { userId: session.user.id, challengeId, hintId }
        }),
        prisma.user.update({
            where: { id: session.user.id },
            data: { spentXp: { increment: hint.cost } }
        })
    ]);

    await createNotification(
        session.user.id,
        "XP_EARNED",
        "Tactical Intel Purchased",
        `You spent ${hint.cost} XP to unlock a hint for ${config.title}.`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
      return NextResponse.json({ error: "Failed to unlock hint" }, { status: 500 });
  }
}
