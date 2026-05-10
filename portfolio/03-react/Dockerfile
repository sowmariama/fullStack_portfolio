FROM node:20-alpine AS builder 

WORKDIR /app

COPY package*.json ./ 

RUN npm install 

COPY . . 

RUN nginx:alpine

COPY --from=builder /app/dist /user/share/nginx/html

EXPOSE 80

CMD ["nginx" , "-g" , "daemon off;"]
