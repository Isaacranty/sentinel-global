import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import yaml from "js-yaml";

const CHALLENGES_DIR = path.join(__dirname, "../challenges");

function build() {
  if (!fs.existsSync(CHALLENGES_DIR)) {
    console.error("Challenges directory not found.");
    return;
  }

  const dirs = fs.readdirSync(CHALLENGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  for (const dirent of dirs) {
    const dirPath = path.join(CHALLENGES_DIR, dirent.name);
    const configPath = path.join(dirPath, "challenge.yml");

    if (!fs.existsSync(configPath)) {
      console.log(`[skip] ${dirent.name} (no challenge.yml)`);
      continue;
    }

    try {
      const config = yaml.load(fs.readFileSync(configPath, "utf-8")) as any;
      const image = config.image;

      if (!image) {
        console.error(`[error] ${dirent.name} has no 'image' field in challenge.yml`);
        continue;
      }

      console.log(`[building] ${dirent.name} -> ${image}`);
      execSync(`docker build -t ${image} .`, {
        cwd: dirPath,
        stdio: "inherit"
      });
    } catch (err) {
      console.error(`[failed] ${dirent.name}:`, err instanceof Error ? err.message : err);
    }
  }
}

build();
