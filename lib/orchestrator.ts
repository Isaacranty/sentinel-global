import Docker from "dockerode";
import crypto from "crypto";
import { prisma } from "./prisma";
import { getChallenge, ChallengeConfig } from "./challenges";

// Connects to the local Docker daemon over its default socket.
// Requires Docker (and ideally gVisor — see docs/ctf-sandbox-design.md)
// installed on whatever host actually runs this, which is NOT this
// sandbox — there's no Docker daemon here, so this file is untested
// against a live daemon. Review it against a real Docker host before
// trusting it with real users.
const docker = new Docker();

const USE_GVISOR = process.env.CTF_USE_GVISOR === "true";
if (!USE_GVISOR) {
  console.warn(
    "[orchestrator] CTF_USE_GVISOR is not 'true' — containers will run " +
      "under the default runc runtime, which shares the host kernel. " +
      "Fine for local orchestrator development; install gVisor and set " +
      "CTF_USE_GVISOR=true before exposing this to real users. See " +
      "docs/ctf-sandbox-design.md."
  );
}

// Hard ceiling on total simultaneously-running containers across all
// visitors and challenges. Without this, nothing stops one visitor
// (or a burst of them) from starting instances until the host runs
// out of memory/CPU/pids — each individual instance is resource-
// limited, but nothing previously limited the count of instances.
const MAX_CONCURRENT_INSTANCES = Number(process.env.CTF_MAX_CONCURRENT_INSTANCES ?? 10);

export class CapacityError extends Error {
  constructor() {
    super("At capacity — try again in a few minutes.");
    this.name = "CapacityError";
  }
}

function parseMemoryToBytes(mem: string): number {
  const match = mem.trim().match(/^(\d+(?:\.\d+)?)([kmg]?)$/i);
  if (!match) throw new Error(`Unrecognized memory string: ${mem}`);
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit === "g" ? 1024 ** 3 : unit === "m" ? 1024 ** 2 : unit === "k" ? 1024 : 1;
  return Math.round(value * multiplier);
}

function generateFlag(): string {
  return `SENTINEL{${crypto.randomBytes(16).toString("hex")}}`;
}

// One active instance per user per challenge — if they already have
// one running, hand back the existing instance instead of spinning
// up a second sandbox for the same person.
export async function findActiveInstance(userId: string, challengeId: string) {
  return prisma.challengeInstance.findFirst({
    where: {
      userId,
      challengeId,
      status: { in: ["starting", "running"] },
      expiresAt: { gt: new Date() },
    },
  });
}

export async function startInstance(userId: string, challengeId: string) {
  const existing = await findActiveInstance(userId, challengeId);
  if (existing) return existing;

  const config = getChallenge(challengeId);
  if (!config) throw new Error(`Unknown challenge: ${challengeId}`);

  const flag = generateFlag();
  const expiresAt = new Date(Date.now() + config.lifetime_minutes * 60 * 1000);

  // Global cap check and reservation in a single transaction to prevent race conditions.
  const instance = await prisma.$transaction(async (tx) => {
    const activeCount = await tx.challengeInstance.count({
      where: { status: { in: ["starting", "running"] } },
    });

    if (activeCount >= MAX_CONCURRENT_INSTANCES) {
      throw new CapacityError();
    }

    return await tx.challengeInstance.create({
      data: { userId, challengeId, flag, status: "starting", expiresAt },
    });
  });

  try {
    const networkName = "ctf-isolated-network";
    const networks = await docker.listNetworks();
    let targetNetwork = networks.find(n => n.Name === networkName);

    if (!targetNetwork) {
        targetNetwork = await docker.createNetwork({
            Name: networkName,
            Driver: "bridge",
            Internal: true,
        }) as any;
    }

    const container = await docker.createContainer({
      Image: config.image,
      Env: [`FLAG=${flag}`],
      HostConfig: {
        NetworkMode: networkName,
        CapDrop: ["ALL"],
        SecurityOpt: ["no-new-privileges:true"],
        ReadonlyRootfs: true,
        Tmpfs: { "/tmp": "size=256m" },
        PidsLimit: config.resources.pids_limit,
        Memory: parseMemoryToBytes(config.resources.memory),
        NanoCpus: Math.round(parseFloat(config.resources.cpus) * 1e9),
        ...(USE_GVISOR ? { Runtime: "runsc" } : {}),
      },
    });

    await container.start();
    const info = await container.inspect();
    const containerIp = info.NetworkSettings.Networks[networkName]?.IPAddress || null;

    if (!containerIp) {
      throw new Error("Container started but got no IP on its isolated network");
    }

    return await prisma.challengeInstance.update({
      where: { id: instance.id },
      data: {
        containerId: container.id,
        networkId: targetNetwork!.Id,
        containerIp,
        status: "running",
      },
    });
  } catch (err) {
    await prisma.challengeInstance.update({
      where: { id: instance.id },
      data: { status: "error" },
    });
    throw err;
  }
}

export async function stopInstance(instanceId: string) {
  const instance = await prisma.challengeInstance.findUnique({ where: { id: instanceId } });
  if (!instance) return null;

  if (instance.containerId) {
    const container = docker.getContainer(instance.containerId);
    await container.stop().catch(() => {}); // may already be stopped
    await container.remove().catch(() => {});
  }
  // Shared networks like 'ctf-isolated-network' should NOT be removed here.
  // We only remove per-instance networks if they follow the 'ctf-instanceId' pattern.

  return prisma.challengeInstance.update({
    where: { id: instanceId },
    data: { status: instance.status === "solved" ? "solved" : "stopped" },
  });
}

// Finds every running/starting instance past its expiry and tears it
// down. Run this on a timer (see scripts/reap-expired.ts) — nothing
// in this app calls it automatically, since a Next.js API route only
// runs when a request comes in, and an expired container should die
// even if nobody happens to poll it.
export async function reapExpired() {
  const expired = await prisma.challengeInstance.findMany({
    where: { status: { in: ["starting", "running"] }, expiresAt: { lte: new Date() } },
  });
  for (const instance of expired) {
    await stopInstance(instance.id).catch((err) =>
      console.error(`[orchestrator] failed to reap ${instance.id}:`, err)
    );
    await prisma.challengeInstance.update({
      where: { id: instance.id },
      data: { status: "expired" },
    });
  }
  return expired.length;
}

import { logActivity } from "./activityStore";
import { createNotification } from "./notifications";

export async function submitFlag(instanceId: string, submitted: string) {
  const instance = await prisma.challengeInstance.findUnique({
    where: { id: instanceId },
    include: { user: { select: { id: true, name: true } } }
  });
  if (!instance) return { correct: false, reason: "not_found" as const };
  if (instance.status === "expired" || instance.status === "stopped") {
    return { correct: false, reason: "expired" as const };
  }

  // Constant-time compare
  const a = Buffer.from(submitted);
  const b = Buffer.from(instance.flag);
  const correct = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (correct && instance.status !== "solved") {
    await prisma.challengeInstance.update({
      where: { id: instanceId },
      data: { status: "solved", solvedAt: new Date() },
    });

    // Log Activity
    const config = getChallenge(instance.challengeId);
    await logActivity(instance.userId, "CHALLENGE_SOLVED", {
      challengeId: instance.challengeId,
      challengeTitle: config?.title || instance.challengeId
    });

    await createNotification(
        instance.userId,
        "XP_EARNED",
        "Signal Decrypted",
        `Successful decryption of ${config?.title || instance.challengeId}. +100 XP issued.`
    );
  }

  return { correct, reason: correct ? ("ok" as const) : ("wrong" as const) };
}
