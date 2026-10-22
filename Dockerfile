# Java 21: compila y ejecuta Umbrella Archives sin modificar las imágenes del repositorio.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY servidor/ servidor/
RUN mkdir -p build && javac -encoding UTF-8 -d build servidor/src/main/java/es/umbrella/*.java

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/ ./build/
COPY web/ ./web/
COPY contenido/ ./contenido/
# Registro local efímero: para sesiones persistentes usar disco gestionado o base de datos.
RUN mkdir -p /app/datos
ENV PORT=10000
EXPOSE 10000
CMD ["java", "-cp", "build", "es.umbrella.Servidor", "."]
