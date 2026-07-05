# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Downloader dependencies to cache them in docker layers
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Create execution image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy the built jar from build stage
COPY --from=build /app/target/codenova-backend-*.jar app.jar
# Expose port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
