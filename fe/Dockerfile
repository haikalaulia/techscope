
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY . .


RUN bun run next build

FROM oven/bun:alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN bun install --production --frozen-lockfile

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "run", "next", "start"]
