import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId, newsUrl, title } = await req.json();
  const userId = session.user.id;

  try {
    const where: any = { userId };
    if (threadId) where.threadId = threadId;
    else if (newsUrl) where.newsUrl = newsUrl;
    else return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const existing = await prisma.bookmark.findFirst({ where });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: { userId, threadId, newsUrl, title: title || "Signal" }
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
