# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la aplicación de producción
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario desde la etapa de build
COPY --from=builder /app ./

# Establecer variable de entorno
ENV NODE_ENV=production

# Exponer el puerto donde Next.js sirve la app en modo prod
EXPOSE 3000

# Comando de producción
CMD ["npm", "start"]
