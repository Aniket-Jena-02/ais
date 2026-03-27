# Use the official Bun image
# See all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

# Set PORT environment variable to 3000 by default (Cloud Run overrides this)
ENV PORT=3000

# Expose the API port
EXPOSE $PORT

# Run the app using Bun as the explicit runtime (--bun prevents Node.js fallback)
USER bun
ENTRYPOINT [ "bun", "run", "--bun", "src/index.ts" ]
