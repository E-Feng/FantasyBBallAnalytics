FROM node:20-alpine3.17 AS builder

# Creating build in first container
RUN mkdir /app
WORKDIR /app
COPY package*.json ./
RUN npm install --silent
COPY  . .
RUN npm run build

# Moving files over to second container
FROM nginx:1.19.6-alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]