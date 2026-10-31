import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createThread, readThreads } from "@/lib/threadsStore";
import { logActivity } from "@/lib/activityStore";

export async function GET() {
  const threads = await readThreads();
  return NextResponse.json({ threads });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "log in to post" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: threadBody, context } = body;

  if (!title || !threadBody) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 }
    );
  }

  const thread = await createThread({
    title,
    body: threadBody,
    authorId: session.user.id,
    context: context || { type: "general" },
  });

  await logActivity(session.user.id, "THREAD_CREATED", {
    threadId: thread.id,
    threadTitle: thread.title
  });

  return NextResponse.json({ thread }, { status: 201 });
}
