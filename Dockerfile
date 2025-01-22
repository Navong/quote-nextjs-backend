FROM node:20

WORKDIR /app

COPY server/package*.json ./

RUN npm i

COPY server/prisma ./prisma

RUN npx prisma generate

COPY server/. .

EXPOSE 4000

CMD [ "npm", "start" ]