import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activityStore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteCode } = await req.json();

  if (!inviteCode) return NextResponse.json({ error: "Invite code is required." }, { status: 400 });

  try {
    const team = await prisma.team.findUnique({
        where: { inviteCode: inviteCode.toUpperCase() },
        include: { members: { select: { id: true } } }
    });

    if (!team) {
        return NextResponse.json({ error: "Invalid squad invite code." }, { status: 404 });
    }

    // Connect user to team
    await prisma.user.update({
        where: { id: session.user.id },
        data: { teamId: team.id }
    });

    await logActivity(session.user.id, "SQUAD_JOINED", {
        teamId: team.id,
        teamName: team.name
    });

    // Notify user joining
    await createNotification(
        session.user.id,
        "SYSTEM",
        "Squad Link Established",
        `You have successfully joined the squad: ${team.name}.`,
        "/squads"
    );

    return NextResponse.json({ success: true });
  } catch (err) {
      return NextResponse.json({ error: "Failed to join squad." }, { status: 500 });
  }
}
