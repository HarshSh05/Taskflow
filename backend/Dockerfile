# ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Now copy sources and build
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Run stage ----------
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
