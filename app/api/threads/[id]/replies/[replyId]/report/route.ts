import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { notifyAdmins } from "@/lib/notifications";
import { uploadFile } from "@/lib/storage";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf", "text/plain"];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; replyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "log in to report content" }, { status: 401 });
  }

  const limit = await rateLimit(`report:${session.user.id}`, { max: 20, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "too many reports — try again later" }, { status: 429 });
  }

  const reply = await prisma.reply.findUnique({ where: { id: params.replyId } });
  if (!reply || reply.threadId !== params.id) {
    return NextResponse.json({ error: "reply not found" }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") || "";
  let reason = "";
  let evidence: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    reason = String(formData.get("reason") || "").trim().slice(0, 500);
    const f = formData.get("evidence");
    if (f instanceof File && f.size > 0) evidence = f;
  } else {
    const body = await req.json().catch(() => ({}));
    reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  }

  if (!reason) {
    return NextResponse.json({ error: "a reason is required" }, { status: 400 });
  }

  let evidenceUrl: string | undefined;
  if (evidence) {
    if (!ALLOWED_TYPES.includes(evidence.type)) {
      return NextResponse.json({ error: "unsupported evidence file type" }, { status: 400 });
    }
    if (evidence.size > MAX_BYTES) {
      return NextResponse.json({ error: "evidence file too large (10MB max)" }, { status: 400 });
    }
    const ext = evidence.name.split(".").pop() || "bin";
    const path = `reports/${session.user.id}/${Date.now()}.${ext}`;
    try {
      const buffer = Buffer.from(await evidence.arrayBuffer());
      evidenceUrl = await uploadFile(path, buffer, evidence.type);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "evidence upload failed" }, { status: 500 });
    }
  }

  const report = await prisma.report.create({
    data: { reason, evidenceUrl, reporterId: session.user.id, replyId: reply.id },
  });

  await notifyAdmins(
    "SYSTEM",
    "New Intelligence Report",
    `A reply has been reported: "${reply.body.slice(0, 50)}${reply.body.length > 50 ? '...' : ''}"`,
    "/admin"
  );

  return NextResponse.json({ report }, { status: 201 });
}
