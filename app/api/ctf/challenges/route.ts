import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listChallenges } from "@/lib/challenges";

export async function GET() {
  const session = await getServerSession(authOptions);

  const challenges = listChallenges().map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    difficulty: c.difficulty,
    description: c.description,
    lifetime_minutes: c.lifetime_minutes,
  }));

  if (session?.user?.id) {
    const solved = await prisma.challengeInstance.findMany({
      where: { userId: session.user.id, status: "solved" },
      select: { challengeId: true },
    });
    const solvedIds = new Set(solved.map((s) => s.challengeId));
    return NextResponse.json({
      challenges: challenges.map((c) => ({
        ...c,
        solved: solvedIds.has(c.id),
      })),
    });
  }

  return NextResponse.json({ challenges });
}
