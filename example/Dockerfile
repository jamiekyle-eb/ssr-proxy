# Stage 1: Builder
FROM node:12.1.0-stretch AS builder
WORKDIR /workdir
COPY package.json .
COPY package-lock.json .
RUN npm ci && test -d node_modules
COPY src src
ENV NODE_ENV=production
RUN npm run -s build

# Stage 2: Runner
FROM nginx:1.15.9
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /workdir/dist/ /usr/share/nginx/html
