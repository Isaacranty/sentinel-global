import { prisma } from "./prisma";

export type NotificationType = "REPLY" | "VERIFIED" | "XP_EARNED" | "SYSTEM";

export async function createNotification(userId: string, type: NotificationType, title: string, message: string, link?: string) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link
    }
  });
}

/**
 * Sends a notification to all administrative accounts.
 */
export async function notifyAdmins(type: NotificationType, title: string, message: string, link?: string) {
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true }
  });

  if (admins.length === 0) return;

  return await prisma.notification.createMany({
    data: admins.map(admin => ({
      userId: admin.id,
      type,
      title,
      message,
      link
    }))
  });
}
