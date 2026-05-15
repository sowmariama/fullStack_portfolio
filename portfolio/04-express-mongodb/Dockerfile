FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Nettoyer le cache et installer
RUN npm cache clean --force && \
    npm install --prefer-offline

COPY . .

EXPOSE 5000 

CMD ["node", "app.js"]
