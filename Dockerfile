# Build Stage
# This build created a staging docker image
#
FROM node:16.14.0-alpine AS appbuild
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY ./src ./src
COPY ./.eslint* ./
COPY ./tsconf* ./
RUN npm run prebuild
RUN npm run build

# Production Stage
# This build takes the production build from staging build
#
FROM node:16.14.0-alpine AS app
WORKDIR /usr/src/app
RUN apk add --no-cache --upgrade bash
COPY package*.json ./
COPY openapi.yaml ./
COPY ./prisma ./
RUN npm ci --production
RUN npx prisma generate
COPY --from=appbuild /usr/src/app/dist ./dist
EXPOSE 3000
RUN chown -R node /usr/src/app

# Add docker-compose-wait tool -------------------
ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

USER node
CMD npm start