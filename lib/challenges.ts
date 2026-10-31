import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export type ChallengeConfig = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  image: string;
  port: number;
  lifetime_minutes: number;
  resources: {
    cpus: string;
    memory: string;
    pids_limit: number;
  };
  skills?: { type: string; level: number }[];
  hints?: { text: string; cost: number }[];
  network: "isolated";
};

const CHALLENGES_DIR = path.join(process.cwd(), "challenges");

export function listChallenges(): ChallengeConfig[] {
  if (!fs.existsSync(CHALLENGES_DIR)) return [];
  return fs
    .readdirSync(CHALLENGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const configPath = path.join(CHALLENGES_DIR, entry.name, "challenge.yml");
      if (!fs.existsSync(configPath)) return null;
      const raw = fs.readFileSync(configPath, "utf-8");
      return yaml.load(raw) as ChallengeConfig;
    })
    .filter((c): c is ChallengeConfig => c !== null);
}

export function getChallenge(id: string): ChallengeConfig | null {
  return listChallenges().find((c) => c.id === id) ?? null;
}
