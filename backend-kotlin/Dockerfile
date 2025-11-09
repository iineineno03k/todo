# Build stage
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Copy gradle files for dependency caching
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle
COPY gradlew ./

# Copy OpenAPI spec
COPY openapi ./openapi

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build application (OpenAPI generation happens automatically)
RUN gradle bootJar --no-daemon

# Runtime stage
FROM amazoncorretto:17-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
