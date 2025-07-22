# Usa una imagen oficial de Node.js
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Copia las variables de entorno si lo necesitas
# (¡NO lo hagas si tu .env tiene secretos y piensas subir esto a un repo público!)
# COPY .env .env

# Expón el puerto que usa tu app (ajústalo si usas otro)
EXPOSE 3000

# Comando para iniciar tu aplicación
CMD ["node", "index.js"]
