FROM node:12.1.0-alpine AS builder
WORKDIR /workdir
# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
RUN apk update && apk upgrade && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
  apk add --no-cache \
  chromium@edge \
  nss@edge \
  freetype@edge \
  harfbuzz@edge \
  ttf-freefont@edge
# Puppeteer v1.11.0 works with Chromium 72.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /workdir
# Run everything after as non-privileged user.
USER pptruser
COPY package.json .
COPY package-lock.json .
ENV NODE_ENV=production
RUN npm install && test -d node_modules
COPY index.js .
CMD [ "npm", "run", "-s", "start" ]
