# Documentación de Payloads para Webhook

Este documento detalla la estructura y el formato de los payloads JSON que el Webhook procesa para la notificación de eventos y metas alcanzadas.

---

## 📐 Estructura Base del Payload

Todos los eventos enviados al Webhook comparten el siguiente esquema raíz:

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `event_type` | `string` | **Sí** | Identificador único del evento (ej. `GOAL_ACHIEVED`). |
| `recipient_email` | `string` | **Sí** | Dirección de correo electrónico del destinatario de la notificación. |
| `data` | `object` | **Sí** | Objeto dinámico que contiene el contexto y métricas según el tipo de meta. |

---

## 📨 Tipos de Evento y Ejemplos

Actualmente, el sistema soporta el evento **`GOAL_ACHIEVED`**, el cual varía su payload en el objeto `data` según la propiedad `goal_type`.

### 1. Meta por Item de Campaña (`goal_type: "item"`)

Se utiliza cuando el progreso o meta está asociado al cumplimiento de un ítem/insumo específico (ej. recolección de víveres o suministros).

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

**Esquema de data para item:**
- org_name (string): Nombre de la organización promotora.

- campaign_name (string): Nombre o título de la campaña.

- goal_type (string): Valor fijo "item".

- item_name (string): Nombre del artículo u objeto a recolectar.

- goal_reached (string/number): Cantidad o valor acumulado hasta el momento.

- goal (string/number): Meta total a alcanzar.

2. Meta Global de Campaña (goal_type: "campaign")
Se utiliza cuando la meta evalúa el desempeño global o general de la campaña (ej. recaudación monetaria o alcance general), sin especificar un ítem individual.

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
**Esquema de data para campaign:**
- org_name (string): Nombre de la organización promotora.

- campaign_name (string): Nombre o título de la campaña.

- goal_type (string): Valor fijo "campaign".

- goal_reached (string/number): Cantidad o valor acumulado hasta el momento.

- goal (string/number): Meta total a alcanzar.

## ⚠️ Manejo de Excepciones y Errores
Eventos no soportados: Si el campo event_type recibido no coincide con ninguno de los tipos declarados en el flujo de automatización (actualmente solo se procesa GOAL_ACHIEVED), el sistema desviará la ejecución hacia la rama de captura de fallos, disparando una notificación de error de enrutamiento.