import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityStore";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const thread = await prisma.thread.findUnique({
      where: { id: params.id },
      select: { verified: true, authorId: true, title: true }
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const updated = await prisma.thread.update({
      where: { id: params.id },
      data: { verified: !thread.verified },
    });

    if (updated.verified) {
      await logActivity(thread.authorId, "VERIFIED_SIGNAL", {
        threadId: params.id,
        threadTitle: thread.title
      });

      await createNotification(
        thread.authorId,
        "VERIFIED",
        "Signal Verified",
        `Central Command has verified your intelligence: ${thread.title}`,
        `/community/${params.id}`
      );
    }

    return NextResponse.json({ verified: updated.verified });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
