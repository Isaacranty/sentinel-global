import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startInstance, CapacityError } from "@/lib/orchestrator";

export async function POST(
  req: NextRequest,
  { params }: { params: { challengeId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "log in to start a challenge" }, { status: 401 });
  }

  try {
    const instance = await startInstance(session.user.id, params.challengeId);
    return NextResponse.json({
      instance: {
        id: instance.id,
        status: instance.status,
        expiresAt: instance.expiresAt,
        // flag and containerIp are never returned to the client —
        // the browser only ever talks to the proxy route below.
      },
    });
  } catch (err) {
    if (err instanceof CapacityError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[ctf/start]", err);
    return NextResponse.json(
      { error: "Couldn't start that challenge. Check server logs." },
      { status: 500 }
    );
  }
}
