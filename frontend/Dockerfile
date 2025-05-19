# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY .env .env

# Copiar el resto del código
COPY . .

# Construir la app
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Copiar artefactos de la build
COPY --from=builder /app ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
