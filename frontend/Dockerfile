FROM node:18-alpine as builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build && \
    npm prune --production

FROM nginx:1.23-alpine as production
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache brotli gzip && \
    find . -type f -name "*.js" -exec brotli -9 {} \; -exec gzip -9 {} \;

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]