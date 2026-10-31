import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const limit = await rateLimit(`register:${clientKey(req)}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "too many accounts created from this network — try again later" },
      { status: 429 }
    );
  }

  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "name, email, and password are required" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "an account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const user = await prisma.user.create({
    data: { email, passwordHash, name, verificationToken },
  });

  // Fire-and-forget-ish: don't block the response on mail delivery,
  // but don't let a mail failure throw out of the route either
  // (sendVerificationEmail already catches internally).
  sendVerificationEmail(email, verificationToken);

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
}
