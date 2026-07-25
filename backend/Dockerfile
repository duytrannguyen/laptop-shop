# Bước 1: Build ứng dụng
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies trước để cache layer này nếu pom.xml không đổi
RUN mvn dependency:go-offline -B
COPY src ./src
# Build bỏ qua test để tăng tốc độ deploy
RUN mvn clean package -DskipTests

# Bước 2: Chạy ứng dụng với JRE siêu nhẹ
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Khai báo port
EXPOSE 8080

# Copy file jar từ bước build
COPY --from=build /app/target/*.jar app.jar

# Tạo thư mục uploads (nếu cần cho backend)
RUN mkdir -p uploads

# Chạy ứng dụng với các tham số tối ưu RAM của JVM cho môi trường container
# -XX:+UseContainerSupport: Nhận diện giới hạn RAM của Docker
# -XX:MaxRAMPercentage=75.0: Dành 75% RAM của container cho Heap
# -Djava.security.egd=file:/dev/./urandom: Tăng tốc độ random lúc khởi chạy
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
