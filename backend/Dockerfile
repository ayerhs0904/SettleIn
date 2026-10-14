# ==========================================
# Multi-Stage Production Dockerfile for SettleIn Backend
# ==========================================

# --- Stage 1: Build JAR with Maven & OpenJDK 17 ---
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache dependency downloads
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Minimal Production JRE Runtime ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Security: Run as non-root user
RUN addgroup -S settlein && adduser -S settlein -G settlein
USER settlein

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Render assigns dynamic PORT environment variable (default: 8080)
ENV PORT=8080
EXPOSE ${PORT}

# Production JVM tuning for containerized memory limits
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
