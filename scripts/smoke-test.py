#!/usr/bin/env python3
"""Pruebas HTTP de Umbrella Archives sin cuentas, contraseñas ni dependencias externas."""
import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("UMBRELLA_TEST_URL", "http://127.0.0.1:18080").rstrip("/")


def request(path, method="GET"):
    """Realiza una petición HTTP y devuelve código, cabeceras y contenido, incluso con 4xx."""
    req = urllib.request.Request(BASE + path, method=method)
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            return response.status, response.headers, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.headers, error.read()


def expect(condition, message):
    """Detiene las pruebas indicando qué requisito de la web no se ha cumplido."""
    if not condition:
        raise AssertionError(message)
    print("OK:", message)


def check():
    """Comprueba portada, wiki, API pública y ausencia de filtraciones de fichas ocultas."""
    for url in ["/", "/wiki/"]:
        status, headers, body = request(url)
        expect(status == 200 and b"html" in body[:1024].lower(), f"{url} devuelve HTML")
        expect(headers.get("X-Content-Type-Options") == "nosniff", f"{url} envía nosniff")

    status, headers, body = request("/api/estado")
    expect(status == 200 and json.loads(body)["ok"] is True, "API de estado saludable")
    expect(headers.get("Cache-Control") == "no-store", "Respuestas API no quedan en caché")

    status, _, body = request("/api/miembro")
    member = json.loads(body)
    expect(status == 200 and member["ok"] is True, "Estado de miembro accesible")
    expect(member.get("miembro") is None, "No existe sesión de prueba por defecto")

    status, _, body = request("/api/wiki")
    index = json.loads(body)
    expect(status == 200 and isinstance(index.get("secciones"), list), "Índice wiki válido")
    for section in index["secciones"]:
        section_id = section["id"]
        status, _, body = request("/api/wiki/" + section_id)
        data = json.loads(body)
        expect(status == 200 and isinstance(data.get("fichas"), list), f"Sección {section_id} cargada")
        for card in data["fichas"]:
            if card.get("oculto") is True:
                expect(set(card).issubset({"id", "oculto", "orden"}), f"Expediente oculto de {section_id} está sellado")
                status, _, _ = request("/api/wiki/" + section_id + "/" + card["id"])
                expect(status == 403, f"Expediente oculto de {section_id} exige miembro")
                break

    status, _, _ = request("/api/wiki/seccion-que-no-existe")
    expect(status == 404, "La API rechaza secciones inexistentes")
    status, _, _ = request("/ruta-que-no-existe")
    expect(status == 404, "Los archivos inexistentes devuelven 404")
    status, _, _ = request("/", method="POST")
    expect(status == 405, "Los archivos estáticos no permiten POST")
    print("Todas las pruebas HTTP finalizaron correctamente.")


if __name__ == "__main__":
    try:
        check()
    except Exception as error:
        print("FALLO:", error, file=sys.stderr)
        sys.exit(1)
