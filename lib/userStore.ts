import { prisma } from "./prisma";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const ALL_BADGES: Record<string, Badge> = {
  FIRST_SIGNAL: { id: "FIRST_SIGNAL", name: "First Signal", description: "Solved your first CTF challenge.", icon: "🎯" },
  PATHFINDER: { id: "PATHFINDER", name: "Pathfinder", description: "Completed a full learning path.", icon: "🛤️" },
  INTEL_CURATOR: { id: "INTEL_CURATOR", name: "Intel Curator", description: "Started a discussion that was verified by an admin.", icon: "💎" },
  GLOBAL_ELITE: { id: "GLOBAL_ELITE", name: "Global Elite", description: "Reached Security Level 05.", icon: "👑" },
};

export async function getUserProfile(userId: string) {
  const [user, solvedChallenges, progress, courseProgress, threads, bookmarks, verifiedThreads, certificates] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: true, spentXp: true, subscribedToBrief: true, createdAt: true, avatarUrl: true },
    }),
    prisma.challengeInstance.findMany({
      where: { userId, status: "solved" },
      select: { challengeId: true, solvedAt: true },
      orderBy: { solvedAt: "desc" },
    }),
    prisma.resourceProgress.findMany({
      where: { userId },
      select: { pathId: true, resourceUrl: true },
    }),
    prisma.courseProgress.findMany({
      where: { userId },
      select: { courseId: true, lessonId: true },
    }),
    prisma.thread.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.thread.count({
      where: { authorId: userId, verified: true }
    }),
    prisma.certificate.findMany({
        where: { userId },
        orderBy: { issuedAt: "desc" }
    })
  ]);

  // XP Calculation
  // CTF: 100 XP each
  // Resources: 25 XP each
  // Lessons: 50 XP each
  // Verified Signal: 150 XP each
  const totalEarnedXp = (solvedChallenges.length * 100) + (progress.length * 25) + (courseProgress.length * 50) + (verifiedThreads * 150);
  const xp = totalEarnedXp - (user?.spentXp || 0);

  // Level Logic: based on total earned XP
  const level = Math.floor(totalEarnedXp / 500) + 1;
  const nextLevelXp = level * 500;
  const levelProgress = Math.round((totalEarnedXp % 500) / 500 * 100);

  // Badge Logic
  const badges: Badge[] = [];
  if (solvedChallenges.length > 0) badges.push(ALL_BADGES.FIRST_SIGNAL);

  // Check for PATHFINDER (requires completion of any path)
  const { LEARNING_PATHS } = require("./learningPaths");
  const pathCompleted = LEARNING_PATHS.some((p: any) => {
    const pathProgress = progress.filter(pr => pr.pathId === p.id);
    return pathProgress.length >= p.resources.length && p.resources.length > 0;
  });
  if (pathCompleted) badges.push(ALL_BADGES.PATHFINDER);

  if (verifiedThreads > 0) badges.push(ALL_BADGES.INTEL_CURATOR);
  if (level >= 5) badges.push(ALL_BADGES.GLOBAL_ELITE);

  // Skill Radar Calculation
  const skillMap: Record<string, number> = {
    WEB: 0,
    NETWORK: 0,
    FORENSICS: 0,
    CRYPTO: 0,
    OSINT: 0
  };

  const challenges = require("./challenges").listChallenges();
  solvedChallenges.forEach(solved => {
      const config = challenges.find((c: any) => c.id === solved.challengeId);
      if (config?.skills) {
          config.skills.forEach((s: any) => {
              if (skillMap[s.type] !== undefined) {
                  skillMap[s.type] += s.level;
              }
          });
      }
  });

  return {
    user,
    solvedChallenges,
    progress,
    courseProgress,
    threads,
    bookmarks,
    xp,
    level,
    nextLevelXp,
    levelProgress,
    badges,
    skillMap,
    certificates
  };
}

export async function getLeaderboard() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      instances: {
        where: { status: "solved" },
        select: { challengeId: true },
      },
    },
  });

  const rankings = users
    .map((u) => ({
      id: u.id,
      name: u.name,
      solvedCount: new Set(u.instances.map((i) => i.challengeId)).size,
    }))
    .sort((a, b) => b.solvedCount - a.solvedCount)
    .slice(0, 20);

  return rankings;
}
