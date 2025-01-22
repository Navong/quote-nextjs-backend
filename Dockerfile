FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm ci

COPY server/prisma ./prisma

RUN npx prisma generate

COPY server/. .

EXPOSE 4000

CMD ["npm", "start"]
