# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias con soporte para conflictos
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Exponer el puerto 3000 para el servidor de desarrollo de Next.js
EXPOSE 3000

# Usar el comando de desarrollo (NO en tiempo de build, SÍ como proceso del contenedor)
CMD ["npm", "run", "dev"]
