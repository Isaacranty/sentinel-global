import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addReply } from "@/lib/threadsStore";
import { logActivity } from "@/lib/activityStore";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "log in to reply" }, { status: 401 });
  }

  const body = await req.json();
  const { body: replyBody } = body;

  if (!replyBody) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const reply = await addReply(params.id, { body: replyBody, authorId: session.user.id });
  if (!reply) {
    return NextResponse.json({ error: "thread not found" }, { status: 404 });
  }

  await logActivity(session.user.id, "REPLY_ADDED", {
      threadId: params.id,
      replyId: reply.id
  });

  return NextResponse.json({ reply }, { status: 201 });
}
