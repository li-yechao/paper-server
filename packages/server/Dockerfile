FROM node:16-alpine

RUN apk add go-ipfs

WORKDIR /app/

COPY package.json /app/
RUN yarn install --prod

COPY dist /app/dist

CMD ["yarn", "start:prod", "serve"]
