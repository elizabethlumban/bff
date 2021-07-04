# Stage 1: Use separate small container to build
FROM node:14.16.0 as builder

ENV NODE_TLS_REJECT_UNAUTHORIZED=0
WORKDIR /app

# Cache the global packages - use specific versions for consistency
RUN yarn global add modclean@2.0.0

# Copy only the dependency definitions
COPY package.json package-lock.json ./

# Only re-install if package.json or yarn.lock change
# We also need dev dependencies for "gulp compile" to work
RUN yarn install --ignore-engines

# Copy the code after installing dependencies - Note! .dockerignore
COPY . .

# Compile and optimise dependencies (removed --production from yarn install for tslib error)
RUN npm run build

# Prepare the bundle folder
RUN sh ./bundle.sh

# Stage 2: Build the actual container from the builder's output
FROM node:14.16.0

# Run as a non-root user "node" (created in base image)
USER node
WORKDIR /home/node/app

# Default env vars
ENV NODE_ENV=production
ENV PORT=5010

## Based on https://medium.com/@amirilovic/how-to-fix-node-dns-issues-5d4ec2e12e95
# ENV UV_THREADPOOL_SIZE=64

# This environment variable is ignored when node runs as setuid root or
# has Linux file capabilities set. (https://nodejs.org/api/cli.html)
# ENV NODE_EXTRA_CA_CERTS="To be provided from environment"

# The port we're listening on
EXPOSE ${PORT}

# Copy build bundle from the builder container
COPY --from=builder /app/bundle .

# Use CMD instead of ENTRYPOINT, so we can debug via "docker run -it [container] /bin/sh"
CMD ["npm", "start"]
