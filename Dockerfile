# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.19.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Create a stage for installing production dependencies.
FROM base AS deps

# Copy workspace configuration files
COPY package.json package-lock.json ./
COPY server/package.json ./server/

# Download dependencies as a separate step to take advantage of Docker's caching.
# Install all workspace dependencies including TypeScript (needed for next.config.ts)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspaces

################################################################################
# Create a stage for building the application.
FROM deps AS build

# Install all dependencies including dev dependencies for building
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspaces

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base AS final

# Use production node environment by default.
ENV NODE_ENV=production
# Ensure npm is used instead of yarn
ENV npm_config_user_agent=npm

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/server ./server


# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["npm", "start"]
