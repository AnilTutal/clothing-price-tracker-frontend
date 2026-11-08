FROM node:20-alpine

WORKDIR /app

# Bağımlılık dosyalarını kopyala ve yükle
COPY package*.json ./
RUN npm install

# Proje dosyalarını kopyala
COPY . .

# Vite varsayılan portu
EXPOSE 5173

# Konteyner dışından erişilebilmesi için --host parametresiyle başlat
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
