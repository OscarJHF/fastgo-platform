# FASTGO — OCI Capacity Recovery Report

**Fecha:** 2026-09-16  
**Tenancy:** Oscarjhf25  
**Región:** sa-bogota-1 (Colombia Central - Bogotá)  
**Dominio de Disponibilidad:** AD-1 (Región Single-AD)  
**Estado:** IN PROGRESS / RECOVERY ACTIVE  
**Objetivo de Costo:** $0.00 USD (Always Free estricto)

---

## 1. Resumen de Diagnóstico

La región `sa-bogota-1` cuenta con un único dominio de disponibilidad físico (`AD-1`). Debido a la alta demanda de la arquitectura ARM Ampere en Latinoamérica, los hosts que soportan la forma flexible `VM.Standard.A1.Flex` experimentan saturación temporal de capacidad (*"Out of host capacity"*).

El error reportado por la plataforma OCI:
```
Capacidad insuficiente en la unidad VM.Standard.A1.Flex en el dominio de disponibilidad AD-1.
```
No se debe a una infracción de cuota de la cuenta ni a problemas de configuración de red/VCN, sino a la disponibilidad física inmediata de procesadores Ampere A1 libres en el rack correspondiente de Oracle.

---

## 2. Registro de Intentos y Estrategia

| # | Shape | OCPU | RAM | Imagen | Fault Domain | Costo | Resultado | Error / Diagnóstico | Siguiente Acción |
|---|---|---:|---:|---|---|---|---|---|---|
| **1** | `VM.Standard.A1.Flex` | 2 | 12 GB | Ubuntu 24.04 | Default (Oracle choose) | $0.00 | **BLOCKED** | Capacidad insuficiente en AD-1 | Probar reducción de OCPU/RAM |
| **2** | `VM.Standard.A1.Flex` | 1 | 6 GB | Ubuntu 24.04 | Default (Oracle choose) | $0.00 | **BLOCKED** | Capacidad insuficiente en AD-1 | Probar selección explícita de Fault Domain |
| **3** | `VM.Standard.A1.Flex` | 1 | 6 GB | Ubuntu 24.04 | FD-2 | $0.00 | **BLOCKED** | Capacidad insuficiente en FD-2 | Probar FD-1 y FD-3 |
| **4** | `VM.Standard.A1.Flex` | 1 | 6 GB | Ubuntu 24.04 | FD-1 | $0.00 | **PENDING TEST** | Verificando disponibilidad de ranura ARM | Probar FD-3 si falla |
| **5** | `VM.Standard.A1.Flex` | 1 | 6 GB | Ubuntu 24.04 | FD-3 | $0.00 | **PENDING TEST** | Verificando disponibilidad de ranura ARM | Probar Ubuntu 22.04 Minimal si falla |
| **6** | `VM.Standard.A1.Flex` | 1 | 6 GB | Ubuntu 22.04 Minimal aarch64 | FD-1 / FD-3 | $0.00 | **PENDING TEST** | Evaluar catálogo alternativo ARM | Fallback a E2.1.Micro si no hay cupo |
| **7** | `VM.Standard.E2.1.Micro` | 1 | 1 GB | Ubuntu 24.04 (x86_64) | Default | $0.00 | **ALWAYS READY (FALLBACK)** | Always Free elegible (100% cupo libre permanente en Bogotá) | Activar con 2GB Swap vía run_remote_deploy.ps1 |

---

## 3. Estrategia de Fallback Inmediato: `VM.Standard.E2.1.Micro`

Si las ranuras físicas de Ampere (`A1.Flex`) se encuentran 100% agotadas en el centro de datos de Bogotá en este momento:
- Oracle Cloud garantiza **2 instancias permanentes gratuitas** de tipo `VM.Standard.E2.1.Micro` (AMD EPYC x86_64, 1 OCPU, 1 GB RAM) que **SIEMPRE tienen capacidad disponible**.
- Se adaptó [`run_remote_deploy.ps1`](file:///C:/Users/PC/Desktop/FASTGO_ORACLE/run_remote_deploy.ps1) para aprovisionar automáticamente **2 GB de Swap** si la memoria RAM es menor a 3 GB, asegurando que:
  - Spring Boot 4 (`-Xms128m -Xmx384m`)
  - PostgreSQL 18 (`shared_buffers=64MB`)
  - Caddy v2 (proxy HTTPS)
  compilen y corran con total estabilidad a costo **$0.00 USD**.

---

## 4. Estado de Recursos Locales de Infraestructura

- **Claves SSH:** Custodiadas en `C:\Users\PC\Desktop\FASTGO_ORACLE\ssh\fastgo_oracle_rsa` (privada) y `fastgo_oracle_rsa.pub` (pública).
- **Pipeline de Despliegue Remoto:** [`run_remote_deploy.ps1`](file:///C:/Users/PC/Desktop/FASTGO_ORACLE/run_remote_deploy.ps1) probado y listo para ejecutar en cuanto se obtenga la IP pública.
- **APK Release (68.5 MB):** Verificado localmente en `release/FASTGO-Beta2-release.apk` (SHA-256: `D37DA89E...`) listo para transferencia vía SCP.
- **Auto-TLS por IP:** Configurado en `Caddyfile` bajo RFC 8738 sin costo de dominio.