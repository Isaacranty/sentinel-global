import { NextResponse } from "next/server";
import { getRecentActivities } from "@/lib/activityStore";

export const revalidate = 30; // 30 seconds cache

export async function GET() {
  const activities = await getRecentActivities(10);
  return NextResponse.json({ activities });
}
