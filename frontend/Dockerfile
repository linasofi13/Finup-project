# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el resto del código (incluyendo .env si está en contexto)
COPY . .

# Construir aplicación Next.js
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Copiar artefactos del build
COPY --from=builder /app ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
