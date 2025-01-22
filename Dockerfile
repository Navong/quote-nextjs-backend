FROM alpine:3.21

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY server/package*.json ./

RUN npm i

COPY server/prisma ./prisma

RUN npx prisma generate

COPY server/. .

EXPOSE 4000

CMD [ "npm", "start" ]