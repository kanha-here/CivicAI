FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# Prevent Prisma build failure if DIRECT_URL is absent
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate

EXPOSE 8080

CMD ["node", "src/index.js"]