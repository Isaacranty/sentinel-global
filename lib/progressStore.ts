import { prisma } from "./prisma";

export async function getCompletedUrls(userId: string): Promise<Set<string>> {
  const rows = await prisma.resourceProgress.findMany({
    where: { userId },
    select: { resourceUrl: true },
  });
  return new Set(rows.map((r: { resourceUrl: string }) => r.resourceUrl));
}

export async function toggleProgress(
  userId: string,
  pathId: string,
  resourceUrl: string
): Promise<{ completed: boolean }> {
  const existing = await prisma.resourceProgress.findUnique({
    where: { userId_resourceUrl: { userId, resourceUrl } },
  });

  if (existing) {
    await prisma.resourceProgress.delete({ where: { id: existing.id } });
    return { completed: false };
  }

  await prisma.resourceProgress.create({
    data: { userId, pathId, resourceUrl },
  });
  return { completed: true };
}
