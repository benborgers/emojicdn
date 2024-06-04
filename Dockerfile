FROM oven/bun
COPY . .
RUN apt-get update && apt-get install -y curl
RUN bun install
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "index.ts"]
