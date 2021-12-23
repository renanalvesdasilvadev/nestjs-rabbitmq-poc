FROM node:14-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY . .

COPY --chown=node:node . .

RUN rm -R -f node_modules

RUN rm -f package-lock.json

RUN npm install

RUN rm -R -f dist

RUN npm run build

USER node

EXPOSE 3000

CMD [ "node", "./dist/main.js" ]