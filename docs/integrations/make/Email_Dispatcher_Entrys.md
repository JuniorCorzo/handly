# Documentación de Payloads para Webhook (Make / Email Dispatcher)

Este documento detalla la estructura, seguridad y formato de los payloads JSON que el Webhook de Make procesa para el envío automatizado de correos electrónicos a donantes y organizaciones.

---

## 🔒 Seguridad y Autenticación

Todas las solicitudes enviadas desde la aplicación hacia Make incluyen los siguientes encabezados:

| Encabezado | Valor | Descripción |
| :-- | :-- | :-- |
| `Content-Type` | `application/json` | Formato del cuerpo de la petición. |
| `x-make-apikey` | `<MAKE_WEBHOOK_API_KEY>` | Encabezado estándar requerido por los Webhooks de Make. |
| `X-Make-Api-Key` | `<MAKE_WEBHOOK_API_KEY>` | Variante de compatibilidad. |
| `Authorization` | `Bearer <MAKE_WEBHOOK_API_KEY>` | Token Bearer equivalente para módulos estándar de webhook. |

---

## 📐 Estructura Base del Payload

Todos los eventos enviados al Webhook comparten el siguiente esquema raíz:

| Campo | Tipo | Requerido | Descripción |
| :-- | :-- | :-- | :-- |
| `event_type` | `string` | **Sí** | Identificador único del evento (`DONOR_COMMITMENT`, `GOAL_ACHIEVED`). |
| `recipient_email` | `string` | **Sí** | Dirección de correo electrónico del destinatario de la notificación. |
| `data` | `object` | **Sí** | Objeto dinámico que contiene el contexto y métricas según el tipo de evento. |

---

## 📨 Tipos de Evento y Ejemplos

### 1. Compromiso de Donante (`event_type: "DONOR_COMMITMENT"`)

Se dispara inmediatamente tras la creación exitosa de un compromiso de donación (`createPledge` / `SA_Pledge`). Envía al donante su código único `SOS-XXXX`, la fecha/hora de expiración y los centros de acopio habilitados.

```json
{
  "event_type": "DONOR_COMMITMENT",
  "recipient_email": "donante@example.com",
  "data": {
    "donor_name": "Juan Pérez",
    "org_name": "Cruz Roja Argentina",
    "campaign_name": "Campaña Temporal de Invierno",
    "item_name": "Agua mineral 2L",
    "quantity": "5",
    "commitment_code": "SOS-8F2A",
    "expires_at": "22/08/2026 18:00 Hs",
    "collection_points": [
      {
        "name": "Sede Central",
        "address": "Av. Corrientes 1234",
        "schedule": "Lun a Vie 9 a 18 hs",
        "latitude": -34.603722,
        "longitude": -58.381592
      },
      {
        "name": "Centro Norte",
        "address": "Calle Belgrano 567",
        "schedule": "Sáb 10 a 14 hs",
        "latitude": -34.612345,
        "longitude": -58.398765
      }
    ]
  }
}
```

---

### 2. Meta por Ítem de Campaña (`event_type: "GOAL_ACHIEVED"`, `goal_type: "item"`)

Se utiliza cuando se alcanza la meta de recolección de un insumo específico.

```json
{
  "event_type": "GOAL_ACHIEVED",
  "recipient_email": "ramirorodcas.dev@gmail.com",
  "data": {
    "org_name": "Organización Muy Muy Altruista",
    "campaign_name": "Campaña donativa 'Todos x Colombia'",
    "goal_type": "item",
    "item_name": "Agua mineral",
    "goal_reached": "5000",
    "goal": "10000"
  }
}
```

---

### 3. Meta Global de Campaña (`event_type: "GOAL_ACHIEVED"`, `goal_type: "campaign"`)

Se utiliza cuando la meta evalúa el desempeño global de la campaña.

```json
{
  "event_type": "GOAL_ACHIEVED",
  "recipient_email": "ramirorodcas.dev@gmail.com",
  "data": {
    "org_name": "Organización Muy Muy Altruista",
    "campaign_name": "Campaña donativa 'Todos x Colombia'",
    "goal_type": "campaign",
    "goal_reached": "5000",
    "goal": "10000"
  }
}
```

---

## ⚠️ Manejo de Excepciones y Errores

1. **Variables no configuradas:** Si `MAKE_WEBHOOK_URL` no está presente en el entorno, el servicio omite el despacho y registra un warning en consola sin bloquear la respuesta de la Server Action.
2. **Fallas HTTP o de red:** Los errores de conexión o respuestas con código != 2xx son capturados en logs sin interrumpir la experiencia del usuario final.
