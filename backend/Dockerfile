FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json backend/
RUN npm ci --omit=dev 2>/dev/null || npm install
COPY backend ./backend
COPY services ./services
COPY engines ./engines
COPY types.ts constants.ts ./
WORKDIR /app/backend
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
