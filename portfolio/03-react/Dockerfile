FROM node:20-alpine AS builder 

WORKDIR /app

COPY package*.json ./ 

# Nettoyer le cache npm pour éviter les problèmes
RUN npm cache clean --force

# Installer les dépendances
RUN npm install --prefer-offline

COPY . . 

RUN npm run build

#Serveur Nginx pour servir les fichiers statiques
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx" , "-g" , "daemon off;"]
