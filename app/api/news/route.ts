import { getNews } from "@/lib/getNews";
import { NextResponse } from "next/server";

// Revalidate this route's cache every 15 minutes instead of hitting
// every source on every page load.
export const revalidate = 900;

export async function GET() {
  const { items, failedSources } = await getNews();
  return NextResponse.json({ items, failedSources });
}
