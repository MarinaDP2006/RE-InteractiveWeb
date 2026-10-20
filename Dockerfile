# =============================================================================
#  Dockerfile — Imagen de UMBRELLA ARCHIVES para Render (o cualquier hosting
#  que acepte Docker: Koyeb, Railway, Fly.io...).
# =============================================================================
#  Etapa 1 (compilar): compila el servidor Java y descarga el driver de
#  PostgreSQL (solo se usa si defines DATABASE_URL).
#  Etapa 2 (ejecutar): imagen JRE ligera con la web, la semilla y el servidor.
# =============================================================================

# ---------- Etapa 1: compilación ----------
FROM eclipse-temurin:21-jdk-alpine AS compilar
WORKDIR /app
COPY servidor ./servidor
RUN javac -encoding UTF-8 -d build $(find servidor/src/main/java -name "*.java")
# Driver JDBC de PostgreSQL (para guardar los datos de forma permanente)
ADD https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.4/postgresql-42.7.4.jar /app/lib/postgresql.jar

# ---------- Etapa 2: ejecución ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuario sin privilegios (buena práctica de seguridad)
RUN addgroup -S umbrella && adduser -S umbrella -G umbrella

COPY --from=compilar /app/build ./build
COPY --from=compilar /app/lib ./lib
COPY web ./web
COPY semilla ./semilla
RUN mkdir -p data && chown -R umbrella:umbrella /app
USER umbrella

# Render asigna el puerto en la variable PORT.
ENV PORT=8080
EXPOSE 8080

# MaxRAMPercentage: aprovecha bien los 512 MB del plan gratuito.
CMD ["java", "-XX:MaxRAMPercentage=75", "-cp", "build:lib/postgresql.jar", "es.umbrella.Servidor", "/app"]
