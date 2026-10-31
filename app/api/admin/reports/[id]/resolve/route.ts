import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    return NextResponse.json({ error: "report not found" }, { status: 404 });
  }

  // Optional: also remove the reported content in the same action.
  // Deleting a thread/reply cascades to any other open reports
  // pointing at it, so we don't need to clean those up separately.
  const body = await req.json().catch(() => ({}));
  if (body.deleteContent) {
    if (report.threadId) {
      await prisma.thread.delete({ where: { id: report.threadId } }).catch(() => {});
    } else if (report.replyId) {
      await prisma.reply.delete({ where: { id: report.replyId } }).catch(() => {});
    }
  }

  const updated = await prisma.report.update({
    where: { id: params.id },
    data: { status: "resolved" },
  }).catch(() => null);

  // If the content was deleted above, the report itself may have
  // been cascade-deleted along with it — that's fine, treat it as
  // a successful resolution either way.
  return NextResponse.json({ success: true, deleted: !updated });
}
