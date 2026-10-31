# Debian-based (not alpine) — a couple of your dependencies (ssh2's
# optional native addon, dockerode) are safer to build against glibc
# than musl. Single-stage on purpose: several of your npm scripts
# (ctf:scheduler, admin:promote) run via `tsx`, a devDependency, so
# devDependencies need to stay in the final image, not get pruned.

FROM node:20-bookworm-slim

# python3/make/g++ let npm rebuild any native addons (e.g. ssh2's
# cpu-features) during install instead of failing on missing binaries.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first so `npm install` is cached unless deps change
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install

# Now copy the rest of the source and build
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
