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
COPY package*.json ./
RUN npm ci --production
COPY --from=appbuild /usr/src/app/dist ./dist
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD npm start