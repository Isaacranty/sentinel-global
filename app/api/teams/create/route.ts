import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activityStore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description } = await req.json();

  if (!name || name.length < 3) {
      return NextResponse.json({ error: "Team name must be at least 3 characters." }, { status: 400 });
  }

  // Generate unique invite code
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const team = await prisma.team.create({
        data: {
            name,
            description,
            inviteCode,
            members: {
                connect: { id: session.user.id }
            }
        }
    });

    await prisma.user.update({
        where: { id: session.user.id },
        data: { isTeamLeader: true }
    });

    await logActivity(session.user.id, "SQUAD_JOINED", {
        teamId: team.id,
        teamName: team.name,
        isLeader: true
    });

    await createNotification(
        session.user.id,
        "SYSTEM",
        "Squad Commissioned",
        `You have successfully formed the squad: ${name}. Your invite code is ${inviteCode}.`,
        "/profile"
    );

    return NextResponse.json({ team });
  } catch (err: any) {
      if (err.code === 'P2002') {
          return NextResponse.json({ error: "A squad with this name already exists." }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create squad." }, { status: 500 });
  }
}
