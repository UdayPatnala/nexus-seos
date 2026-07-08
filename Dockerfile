# Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build
COPY apps/api/pom.xml apps/api/
COPY apps/api/src apps/api/src
RUN mvn -f apps/api/pom.xml clean package -DskipTests -B

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/apps/api/target/nexus-seos-api-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
