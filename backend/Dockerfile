FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --ignore-scripts

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN mkdir -p uploads/products uploads/profiles logs

EXPOSE 8080

CMD ["node", "src/server.js"]
