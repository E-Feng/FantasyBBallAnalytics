FROM node:15.5.1-alpine3.11 AS builder

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
CMD ["nginx", "-g", "daemon off;"]