FROM node:18-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache --virtual .gyp python3 pkgconfig make g++ pixman-dev cairo-dev pango-dev

COPY package.* ./
COPY yarn.lock ./

RUN yarn install

ENV NODE_OPTIONS="--openssl-legacy-provider"

CMD [ "yarn", "start:dev" ]
