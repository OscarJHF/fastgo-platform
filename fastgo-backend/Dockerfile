# Stage 1: Build Spring Boot JAR
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime Image (Hardened, non-root user)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S fastgo && adduser -S fastgo -G fastgo
USER fastgo
COPY --from=builder /build/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]