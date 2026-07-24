FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN mkdir -p uploads
EXPOSE 8888
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node src/server.js"]
