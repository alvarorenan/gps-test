# Multi-stage build for Angular frontend
FROM node:18-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN rm -rf node_modules package-lock.json && npm install
COPY . ./
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist/front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
