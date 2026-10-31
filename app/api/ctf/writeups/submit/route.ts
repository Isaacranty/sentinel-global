import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";
import { uploadFile } from "@/lib/storage";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf", "text/plain"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const challengeId = String(formData.get("challengeId") || "");
  const title = String(formData.get("title") || "");
  const content = String(formData.get("content") || "");
  const attachment = formData.get("attachment");

  // Check if they solved it
  const solved = await prisma.challengeInstance.findFirst({
      where: { userId: session.user.id, challengeId, status: "solved" }
  });

  if (!solved) {
      return NextResponse.json({ error: "You must solve the challenge first." }, { status: 403 });
  }

  let attachmentUrl: string | undefined;
  if (attachment instanceof File && attachment.size > 0) {
    if (!ALLOWED_TYPES.includes(attachment.type)) {
      return NextResponse.json({ error: "unsupported attachment type" }, { status: 400 });
    }
    if (attachment.size > MAX_BYTES) {
      return NextResponse.json({ error: "attachment too large (10MB max)" }, { status: 400 });
    }
    const ext = attachment.name.split(".").pop() || "bin";
    const path = `writeups/${session.user.id}/${Date.now()}.${ext}`;
    try {
      const buffer = Buffer.from(await attachment.arrayBuffer());
      attachmentUrl = await uploadFile(path, buffer, attachment.type);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "attachment upload failed" }, { status: 500 });
    }
  }

  try {
    const writeUp = await prisma.writeUp.create({
        data: {
            challengeId,
            title,
            content,
            attachmentUrl,
            authorId: session.user.id
        }
    });

    await notifyAdmins(
        "SYSTEM",
        "New Mission Report",
        `Operator ${session.user.name || session.user.email} submitted a report for: ${title}`,
        "/admin"
    );

    return NextResponse.json({ writeUp });
  } catch (err) {
      return NextResponse.json({ error: "Failed to submit write-up" }, { status: 500 });
  }
}
