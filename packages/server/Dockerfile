FROM node:16-slim

WORKDIR /app/

COPY package.json /app/
COPY go-ipfs/ /app/go-ipfs/
RUN yarn install --prod

COPY dist /app/dist

CMD ["yarn", "start:prod", "serve"]
