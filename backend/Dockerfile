FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node prisma ./prisma
RUN npx prisma generate
COPY --chown=node:node src ./src
RUN mkdir -p uploads && chown node:node uploads
USER node
EXPOSE 8888
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:8888/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node src/server.js"]
