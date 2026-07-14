FROM node:24-slim AS build

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
RUN npm run build


FROM node:24-slim

ENV NODE_ENV=production

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "."]
