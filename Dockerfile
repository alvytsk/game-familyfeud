FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
COPY apps/admin/package.json apps/admin/
COPY apps/screen/package.json apps/screen/
RUN pnpm install --frozen-lockfile

# Build shared
FROM deps AS build-shared
COPY packages/shared packages/shared
COPY tsconfig.base.json ./
RUN pnpm --filter @familyfeud/shared build

# Build screen
FROM build-shared AS build-screen
COPY apps/screen apps/screen
RUN pnpm --filter @familyfeud/screen build

# Build admin
FROM build-shared AS build-admin
COPY apps/admin apps/admin
RUN pnpm --filter @familyfeud/admin build

# Build server
FROM build-shared AS build-server
COPY apps/server apps/server
RUN pnpm --filter @familyfeud/server build

# Production
FROM base AS production
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
COPY apps/admin/package.json apps/admin/
COPY apps/screen/package.json apps/screen/
RUN pnpm install --frozen-lockfile --prod

COPY --from=build-shared /app/packages/shared/dist packages/shared/dist
COPY --from=build-server /app/apps/server/dist apps/server/dist
COPY --from=build-screen /app/apps/screen/dist apps/screen/dist
COPY --from=build-admin /app/apps/admin/dist apps/admin/dist

# Copy sample data
COPY data/packs data/packs

ENV PORT=3000
ENV HOST=0.0.0.0
ENV DATA_PATH=/app/data/packs
EXPOSE 3000

CMD ["node", "apps/server/dist/index.js"]
