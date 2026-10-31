import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "log in to update your avatar" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "unsupported image type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "image too large (5MB max)" }, { status: 400 });
  }

  const ext = file.type.split("/")[1] || "png";
  const path = `avatars/${session.user.id}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(path, buffer, file.type);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: url },
    });

    return NextResponse.json({ avatarUrl: url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "upload failed" }, { status: 500 });
  }
}
