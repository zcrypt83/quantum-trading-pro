FROM node:18-slim as builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config

USER 1001
EXPOSE 3000

CMD ["dist/server.js"]