FROM oven/bun
COPY . .
RUN bun install
EXPOSE 3000
CMD ["bun", "index.ts"]
