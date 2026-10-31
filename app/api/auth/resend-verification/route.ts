import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "log in first" }, { status: 401 });
  }

  const limit = await rateLimit(`resend-verify:${session.user.id}`, { max: 3, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "too many requests — try again later" }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "account not found" }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ error: "already verified" }, { status: 400 });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({ where: { id: user.id }, data: { verificationToken } });
  await sendVerificationEmail(user.email, verificationToken);

  return NextResponse.json({ success: true });
}
