# Stage 1: Builder with full toolchain
FROM node:18-bullseye as builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY . .
RUN npm run build && \
    npm prune --production && \
    find node_modules -name "*.map" -delete

# Stage 2: Optimized runtime image
FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=builder --chown=nonroot:nonroot /app/config ./config

USER nonroot
EXPOSE 3000

CMD ["dist/server.js"]