FROM node:16-slim

WORKDIR /app/

COPY package.json /app/
COPY go-ipfs/ /app/go-ipfs/

# Run twice yarn intall --prod to remove devDependencies
RUN yarn install --prod && yarn install --prod

COPY dist /app/dist

CMD ["yarn", "start:prod", "serve"]
