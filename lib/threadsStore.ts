import { prisma } from "./prisma";

export type ThreadContext =
  | { type: "news"; refTitle: string; refUrl: string }
  | { type: "path"; refTitle: string }
  | { type: "general" };

export type Reply = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type Thread = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  context: ThreadContext;
  replies: Reply[];
  reactionCounts: Record<string, number>;
  userReactions: string[];
  verified: boolean;
};

function toContext(row: {
  contextType: string;
  refTitle: string | null;
  refUrl: string | null;
}): ThreadContext {
  if (row.contextType === "news" && row.refTitle && row.refUrl) {
    return { type: "news", refTitle: row.refTitle, refUrl: row.refUrl };
  }
  if (row.contextType === "path" && row.refTitle) {
    return { type: "path", refTitle: row.refTitle };
  }
  return { type: "general" };
}

function toThread(row: any, currentUserId?: string): Thread {
  const reactionCounts: Record<string, number> = {
    UPVOTE: 0,
    DOWNVOTE: 0,
    SIGNAL: 0,
    ALERT: 0
  };

  row.reactions?.forEach((r: any) => {
    if (reactionCounts[r.type] !== undefined) {
      reactionCounts[r.type]++;
    }
  });

  const userReactions = currentUserId
    ? row.reactions?.filter((r: any) => r.userId === currentUserId).map((r: any) => r.type)
    : [];

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    authorName: row.author.name,
    createdAt: row.createdAt.toISOString(),
    context: toContext(row),
    replies: (row.replies ?? []).map((r: any) => ({
      id: r.id,
      authorName: r.author.name,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
    reactionCounts,
    userReactions: userReactions || [],
    verified: row.verified || false,
  };
}

const INCLUDE = {
  author: true,
  replies: { include: { author: true }, orderBy: { createdAt: "asc" as const } },
  reactions: true,
};

export async function readThreads(currentUserId?: string, sortBy: "recent" | "trending" = "recent"): Promise<Thread[]> {
  const rows = await prisma.thread.findMany({
    include: INCLUDE,
    orderBy: sortBy === "recent" ? { createdAt: "desc" } : undefined,
  });

  let threads = rows.map(r => toThread(r, currentUserId));

  if (sortBy === "trending") {
    threads.sort((a, b) => {
      const scoreA = (a.reactionCounts.UPVOTE || 0) + (a.reactionCounts.SIGNAL || 0) * 2 + (a.reactionCounts.ALERT || 0) * 3 + a.replies.length;
      const scoreB = (b.reactionCounts.UPVOTE || 0) + (b.reactionCounts.SIGNAL || 0) * 2 + (b.reactionCounts.ALERT || 0) * 3 + b.replies.length;
      return scoreB - scoreA;
    });
  }

  return threads;
}

export async function getThread(id: string, currentUserId?: string): Promise<Thread | null> {
  const row = await prisma.thread.findUnique({ where: { id }, include: INCLUDE });
  return row ? toThread(row, currentUserId) : null;
}

export async function getThreadByUrl(url: string): Promise<Thread | null> {
  const row = await prisma.thread.findFirst({ where: { refUrl: url }, include: INCLUDE });
  return row ? toThread(row) : null;
}

export async function getThreadsByUrls(urls: string[]): Promise<Record<string, Thread>> {
  const rows = await prisma.thread.findMany({
    where: { refUrl: { in: urls } },
    include: INCLUDE
  });

  const result: Record<string, Thread> = {};
  rows.forEach(r => {
    if (r.refUrl) result[r.refUrl] = toThread(r);
  });
  return result;
}

export async function createThread(input: {
  title: string;
  body: string;
  authorId: string;
  context: ThreadContext;
}): Promise<Thread> {
  const row = await prisma.thread.create({
    data: {
      title: input.title,
      body: input.body,
      authorId: input.authorId,
      contextType: input.context.type,
      refTitle: "refTitle" in input.context ? input.context.refTitle : null,
      refUrl: "refUrl" in input.context ? input.context.refUrl : null,
    },
    include: INCLUDE,
  });
  return toThread(row);
}

import { createNotification } from "./notifications";

export async function addReply(
  threadId: string,
  input: { body: string; authorId: string }
): Promise<Reply | null> {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { authorId: true, title: true, author: { select: { name: true } } }
  });
  if (!thread) return null;

  const row = await prisma.reply.create({
    data: { body: input.body, authorId: input.authorId, threadId },
    include: { author: true },
  });

  // Notify thread author (if it's not the same person)
  if (thread.authorId !== input.authorId) {
      await createNotification(
          thread.authorId,
          "REPLY",
          "New Intelligence Update",
          `${row.author.name} replied to your signal: ${thread.title}`,
          `/community/${threadId}`
      );
  }

  return {
    id: row.id,
    authorName: row.author.name,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}
