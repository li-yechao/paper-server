FROM node:16-slim

WORKDIR /app/

COPY package.json installProdDeps.js /app/

RUN node installProdDeps.js

COPY dist /app/dist

CMD ["yarn", "start:prod", "serve"]
