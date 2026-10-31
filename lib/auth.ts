import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { rateLimit } from "./rateLimit";

// OAuth providers are only registered if their env vars are actually set,
// so leaving them unconfigured just means those buttons don't show up
// (NextAuth would otherwise throw at startup with empty client ids).
const oauthProviders: NextAuthOptions["providers"] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  oauthProviders.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();

        // Keyed by email rather than IP — protects a specific
        // account from brute force regardless of where attempts
        // come from. Doesn't stop someone brute-forcing many
        // different emails from one IP; that's a coarser problem
        // (see lib/rateLimit.ts's caveats on scaling this properly).
        const limit = await rateLimit(`login:${email}`, { max: 10, windowMs: 15 * 60 * 1000 });
        if (!limit.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // Account was created via Google/GitHub and has no password set —
        // there's nothing to compare against.
        if (!user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        if (user.banned) {
          throw new Error("banned");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: !!user.emailVerified,
        };
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials sign-in already did all its checks (including the
      // banned check, which throws) inside authorize() above.
      if (account?.provider !== "google" && account?.provider !== "github") {
        return true;
      }

      const email = user.email?.toLowerCase().trim();
      if (!email) return false; // shouldn't happen, but no email means we can't link/create a row

      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing) {
        if (existing.banned) return false;
        return true;
      }

      // First time this email has signed in via OAuth — create the row.
      // passwordHash stays null; this account can only ever log in via OAuth
      // unless they later set a password (not currently supported, but the
      // schema allows adding that later).
      await prisma.user.create({
        data: {
          email,
          name: user.name || email.split("@")[0],
          emailVerified: new Date(), // the OAuth provider already verified this email
        },
      });

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Credentials: authorize() already returned our shaped user object
        // (id/role/emailVerified are our internal values).
        if (account?.provider === "credentials") {
          token.id = user.id;
          token.role = (user as any).role;
          token.emailVerified = (user as any).emailVerified;
        } else {
          // OAuth: the `user` object here is the provider's profile, whose
          // `id` is Google/GitHub's own id — NOT our internal User.id. Look
          // up our own row by email (signIn() above guarantees it exists by
          // this point) so the session carries our id/role, not theirs.
          const email = user.email?.toLowerCase().trim();
          const dbUser = email
            ? await prisma.user.findUnique({ where: { email } })
            : null;
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.emailVerified = !!dbUser.emailVerified;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role as string;
      session.user.emailVerified = token.emailVerified as boolean;
      // Fetched fresh (not cached in the JWT) so an avatar change shows
      // up immediately instead of waiting for the next login.
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { avatarUrl: true },
      });
      session.user.avatarUrl = dbUser?.avatarUrl ?? null;
      return session;
    },
  },
};
