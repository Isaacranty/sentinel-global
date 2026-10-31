// Sends the account-verification email. Two backends:
//
// - SMTP_HOST set  -> sends a real email via nodemailer.
// - SMTP_HOST unset -> dev fallback: logs the verification link to
//   the console instead of sending anything. Matches the project's
//   existing "don't require infra you don't have yet" approach (see
//   lib/rateLimit.ts) — you can develop and test the whole flow
//   locally without an email provider, then set SMTP_* when you're
//   ready to actually deliver mail.

function verificationUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;
}

async function getTransport() {
  if (!process.env.SMTP_HOST) return null;

  try {
    // Lazy require so `nodemailer` stays optional for anyone using
    // the console-log fallback and not installing it.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require("nodemailer");
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  } catch (err) {
    console.error(
      "[mail] SMTP_HOST is set but the `nodemailer` package isn't installed. " +
        "Run `npm install nodemailer` or unset SMTP_HOST to use the console-log fallback."
    );
    return null;
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const url = verificationUrl(token);
  const transport = await getTransport();

  if (!transport) {
    console.log(
      `[mail] (dev fallback — no SMTP_HOST configured) Verification link for ${email}:\n  ${url}`
    );
    return;
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || "Sentinel Global <no-reply@sentinel.local>",
      to: email,
      subject: "Verify your Sentinel Global account",
      text: `Confirm your email to finish setting up your account:\n\n${url}\n\nIf you didn't create this account, ignore this email.`,
      html: `<p>Confirm your email to finish setting up your account:</p><p><a href="${url}">${url}</a></p><p>If you didn't create this account, ignore this email.</p>`,
    });
  } catch (err) {
    // Don't fail registration just because mail delivery hiccuped —
    // log it and let the user hit "resend" from their profile.
    console.error(`[mail] Failed to send verification email to ${email}:`, err);
  }
}
