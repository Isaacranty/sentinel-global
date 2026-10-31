import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Visited by clicking the link in the verification email. Redirects
// back into the app rather than returning JSON since a human clicks
// this from their inbox, not a fetch() call.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const base = process.env.NEXTAUTH_URL || req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${base}/login?verify=missing`);
  }

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });
  if (!user) {
    return NextResponse.redirect(`${base}/login?verify=invalid`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), verificationToken: null },
  });

  return NextResponse.redirect(`${base}/login?verify=success`);
}
