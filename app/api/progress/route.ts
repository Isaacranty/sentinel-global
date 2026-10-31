import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCompletedUrls } from "@/lib/progressStore";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ completed: [] });
  }
  const completed = await getCompletedUrls(session.user.id);
  return NextResponse.json({ completed: Array.from(completed) });
}
