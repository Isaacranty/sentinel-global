import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChallenge } from "@/lib/challenges";

// Hop-by-hop headers that must not be forwarded (per RFC 7230 §6.1) —
// forwarding these breaks the proxy or leaks internal transport
// details to the browser.
const STRIP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

// Matches a leading root-relative path in an href/src/action/
// formaction attribute value — i.e. one that starts with a single
// "/" and not "//" (protocol-relative, points off-host) or a scheme.
// Rewriting these to include the proxy prefix is what makes
// multi-page challenges work: without it, a challenge page linking
// to e.g. "/dashboard" would send the browser to this app's own
// "/dashboard" instead of back through the proxy.
const ATTR_REGEX = /\b(href|src|action|formaction)=(["'])\/(?!\/)/g;

function rewriteHtml(html: string, prefix: string): string {
  let out = html.replace(ATTR_REGEX, (_match, attr, quote) => `${attr}=${quote}${prefix}/`);

  // A bare <base href="..."> would otherwise fight with the rewritten
  // relative links below it; if the challenge sets one, point it at
  // the proxy root too rather than leaving it targeting the real host.
  out = out.replace(
    /<base\s+href=(["'])\/(?!\/)([^"']*)\1/i,
    (_m, quote, rest) => `<base href=${quote}${prefix}/${rest}${quote}`
  );

  return out;
}

async function handle(
  req: NextRequest,
  { params }: { params: { id: string; path?: string[] } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const instance = await prisma.challengeInstance.findUnique({ where: { id: params.id } });
  if (!instance || instance.userId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (instance.status !== "running" || !instance.containerIp) {
    return NextResponse.json({ error: "instance not running" }, { status: 409 });
  }

  const config = getChallenge(instance.challengeId);
  if (!config) {
    return NextResponse.json({ error: "challenge config missing" }, { status: 500 });
  }

  // Containers are on an `Internal: true` Docker network — reachable
  // from the host (this server) by IP, but not from the internet or
  // other instances. This request never leaves the host process.
  const targetPath = params.path?.join("/") ?? "";
  const search = req.nextUrl.search;
  const targetUrl = `http://${instance.containerIp}:${config.port}/${targetPath}${search}`;
  const proxyPrefix = `/api/ctf/instance/${instance.id}/proxy`;

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_HEADERS.has(key.toLowerCase())) forwardHeaders.set(key, value);
  });

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error(`[ctf-proxy] upstream fetch failed for instance ${instance.id}:`, err);
    return NextResponse.json({ error: "challenge container unreachable" }, { status: 502 });
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value);
  });

  // Redirects: a challenge that 302s to a root-relative path (e.g.
  // after a login form posts to "/") needs that Location rewritten
  // the same way HTML links are, or the browser follows it straight
  // to this app's own route instead of back through the proxy.
  const location = responseHeaders.get("location");
  if (location && location.startsWith("/") && !location.startsWith("//")) {
    responseHeaders.set("location", `${proxyPrefix}${location}`);
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    const body = await upstream.text();
    const rewritten = rewriteHtml(body, proxyPrefix);
    return new NextResponse(rewritten, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  // Non-HTML (images, JS, CSS, JSON, etc.) is streamed through as-is.
  // Known gap: CSS with root-relative url(/...) references isn't
  // rewritten, so a challenge that relies on that for e.g. background
  // images will break — same category of problem as the HTML case,
  // just not handled yet. Worth adding here if a challenge needs it.
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
