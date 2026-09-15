# FASTGO â€” GuÃ­a y PolÃ­tica de Costo Cero (Oracle Cost Guard Always Free)

**Objetivo:** Garantizar que la infraestructura de FASTGO opere indefinidamente a **$0.00 USD** sin generar cargos inesperados.

---

## 1. Recursos Permitidos (Always Free Eligible)

En Oracle Cloud Infrastructure (OCI), los siguientes recursos estÃ¡n etiquetados formalmente como **Always Free** y nunca generan factura:

| Recurso | LÃ­mite Gratuito Mensual | ConfiguraciÃ³n Asignada a FASTGO |
|---|---|---|
| **Compute Ampere A1 (ARM)** | 4 OCPU / 24 GB RAM (total tenancy) | **2 OCPU / 12 GB RAM** (`VM.Standard.A1.Flex`) |
| **Compute AMD Micro (x86)** | Hasta 2 instancias `VM.Standard.E2.1.Micro` | 1 OCPU / 1 GB RAM (Opcional / Fallback) |
| **Almacenamiento en Bloque** | 200 GB total (Boot Volume + Block Volume) | **50 GB** Boot Volume |
| **TrÃ¡fico Saliente (Outbound)** | 10 TB por mes | < 50 GB estimados |
| **DirecciÃ³n IPv4 PÃºblica** | 1 direcciÃ³n IP pÃºblica efÃ­mera/reservada | 1 IP pÃºblica asignada a la VM |
| **Load Balancer** | 1 balanceador flexible (10 Mbps) | No requerido (Caddy maneja proxy directo) |

---

## 2. Recursos Estrictamente Prohibidos (Generan Cobro)

> [!CAUTION]
> NUNCA actives ni aprovisiones los siguientes servicios en tu cuenta OCI:
> 1. **Instancias Standard x86 (Intel / AMD grandes):** Ej. `VM.Standard3.Flex`, `VM.Standard.E4.Flex` con mÃ¡s de 1 OCPU.
> 2. **Bases de Datos AutonÃ³micas Pagas:** Oracle Autonomous Database mÃ¡s allÃ¡ del lÃ­mite gratuito.
> 3. **Almacenamiento Excedente:** Boot Volumes de mÃ¡s de 200 GB acumulados en la cuenta.
> 4. **IPs PÃºblicas Adicionales sin asignar:** Dejar IPs reservadas desvinculadas de una VM genera cobro por hora.
> 5. **Upgrades a "Pay As You Go":** MantÃ©n la cuenta en el tier gratuito original sin hacer clic en *Upgrade Account*.

---

## 3. ConfiguraciÃ³n de Presupuesto y Alerta de FacturaciÃ³n ($0 USD)

Para tener certeza de que no existe ningÃºn cobro accidental:
1. En la consola OCI, ve a **Billing & Cost Management > Budgets**.
2. Haz clic en **Create Budget**.
3. ConfiguraciÃ³n recomendada:
   - **Budget Scope:** Cost Tracking Tag o Compartment (root).
   - **Target Amount:** `$1.00 USD` (o el mÃ­nimo permitido).
   - **Alert Rule:** Enviar correo a `oscar.jhonny123456987@gmail.com` si el gasto real supera el `10%` o si el pronÃ³stico supera `$0.50 USD`.
4. De esta manera, si por error se levantara un recurso de pago, recibirÃ¡s una notificaciÃ³n de inmediato antes de acumular costos significativos.

---

## 4. PolÃ­tica Ante "Out of Host Capacity"

Si al crear la instancia `VM.Standard.A1.Flex` (2 OCPU / 12 GB) la consola muestra:
`Out of host capacity for shape VM.Standard.A1.Flex in availability domain AD-1`

**Protocolo de AcciÃ³n:**
1. **NO** selecciones una forma de pago.
2. Prueba cambiando el **Availability Domain** (AD-2 o AD-3) dentro de la misma Home Region.
3. Si todos los ADs estÃ¡n saturados, crea provisionalmente una instancia `VM.Standard.E2.1.Micro` (Always Free) o reintenta la creaciÃ³n de la forma Ampere mÃ¡s tarde.
4. Documenta el estado como `ORACLE BLOCKED â€” OUT OF HOST CAPACITY`.