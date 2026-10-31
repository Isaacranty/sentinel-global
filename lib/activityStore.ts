import { prisma } from "./prisma";

export type ActivityType =
  | "CHALLENGE_SOLVED"
  | "COURSE_COMPLETED"
  | "VERIFIED_SIGNAL"
  | "LEVEL_UP"
  | "THREAD_CREATED"
  | "REPLY_ADDED"
  | "XP_EARNED"
  | "SQUAD_JOINED";

export async function logActivity(userId: string, type: ActivityType, data: any) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { teamId: true }
  });

  return await prisma.activity.create({
    data: {
      userId,
      teamId: user?.teamId,
      type,
      data: JSON.stringify(data),
    },
  });
}

export async function getRecentActivities(limit = 10) {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  return activities.map(a => ({
    ...a,
    data: JSON.parse(a.data)
  }));
}
