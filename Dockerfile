FROM oven/bun
COPY . .
RUN bun install
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "index.ts"]
