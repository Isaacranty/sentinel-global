import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toggleProgress } from "@/lib/progressStore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "log in to track progress" }, { status: 401 });
  }

  const body = await req.json();
  const { pathId, resourceUrl } = body;
  if (!pathId || !resourceUrl) {
    return NextResponse.json({ error: "pathId and resourceUrl are required" }, { status: 400 });
  }

  const result = await toggleProgress(session.user.id, pathId, resourceUrl);
  return NextResponse.json(result);
}
