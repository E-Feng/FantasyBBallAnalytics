FROM node:12-alpine AS builder

# Creating build in initial container
WORKDIR /usr/src/app/client
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build

# Moving over to 2nd container
FROM nginx:1.18.0-alpine
COPY --from=builder /usr/src/app/client/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]