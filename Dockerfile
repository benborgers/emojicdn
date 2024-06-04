FROM oven/bun
RUN apk add --no-cache libc6-compat curl
COPY . .
RUN bun install
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "index.ts"]
