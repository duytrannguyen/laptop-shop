# Bước 1: Build ứng dụng React với Node.js
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Cài đặt tất cả dependencies
RUN npm ci
COPY . .
# Build ra thư mục dist
RUN npm run build

# Bước 2: Phục vụ file tĩnh bằng Nginx (siêu nhẹ, không tốn RAM chạy Node)
FROM nginx:alpine
# Cấu hình Nginx được mount từ docker-compose (thư mục configs/)
# Copy file build từ bước 1 sang thư mục html của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
