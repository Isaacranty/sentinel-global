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
    const updated = await prisma.writeUp.update({
      where: { id: params.id },
      data: { verified: true },
      include: { author: { select: { id: true, name: true } } }
    });

    await logActivity(updated.authorId, "VERIFIED_SIGNAL", {
        writeUpId: updated.id,
        title: updated.title,
        message: "Mission Report was verified by Command."
    });

    await createNotification(
        updated.authorId,
        "VERIFIED",
        "Mission Report Verified",
        `Command has verified your tactical write-up: ${updated.title}`,
        `/ctf/${updated.challengeId}`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
}
