#!/usr/bin/env bash
set -euo pipefail

echo "============================================================"
echo "FASTGO â€” Oracle Cloud Always Free Production Deploy Script"
echo "Target Shape: VM.Standard.A1.Flex (2 OCPU / 12 GB RAM)"
echo "Database: fastgo_prod (PostgreSQL 18 + Flyway)"
echo "============================================================"

# Ensure Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[+] Docker no encontrado. Instalando Docker CE..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "[+] Docker instalado exitosamente."
fi

# Ensure Docker Compose plugin is installed
if ! docker compose version &> /dev/null; then
    echo "[+] Instalando Docker Compose Plugin..."
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin || sudo dnf install -y docker-compose-plugin
fi

# Ensure .env file exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "[!] Creando .env a partir de .env.example..."
        cp .env.example .env
        echo "[!] ATENCION: Edita .env con tus credenciales seguras antes de iniciar en produccion!"
    else
        echo "[ERROR] No se encontro archivo .env ni .env.example!"
        exit 1
    fi
fi

# Pull and rebuild containers
echo "[+] Construyendo e iniciando contenedores en red interna aislada..."
docker compose build --pull
docker compose up -d --remove-orphans

echo "[+] Verificando estado de contenedores..."
docker compose ps

echo "============================================================"
echo "Despliegue completado exitosamente."
echo "API Backend: http://localhost:8080 (Interno tras Caddy)"
echo "Base de Datos: fastgo_prod (Interno, puerto 5432 no expuesto)"
echo "Proxy Seguro Caddy: Puertos 80/443 abiertos"
echo "============================================================"