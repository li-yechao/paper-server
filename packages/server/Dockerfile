FROM node:16 AS build

WORKDIR /app

COPY . /app

RUN yarn install && \
	yarn build && \
	yarn install --prod && \
	rm -rf /target && \
	mkdir -p /target && \
	cp -r /app/package.json /app/node_modules /app/dist /target/

FROM node:16-slim

WORKDIR /app/

COPY --from=build /target .

CMD ["yarn", "start:prod", "serve"]
