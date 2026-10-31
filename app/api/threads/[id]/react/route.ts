import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await req.json();
  const validTypes = ["UPVOTE", "DOWNVOTE", "SIGNAL", "ALERT"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
  }

  const userId = session.user.id;
  const threadId = params.id;

  try {
    const existing = await (prisma as any).reaction.findUnique({
      where: {
        userId_threadId_type: { userId, threadId, type }
      }
    });

    if (existing) {
      await (prisma as any).reaction.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ reacted: false });
    } else {
      await (prisma as any).reaction.create({
        data: { userId, threadId, type }
      });
      return NextResponse.json({ reacted: true });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
