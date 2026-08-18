# Documentacion de las entradas JSON que el WebHook puede recibir

Meta de campaña:
```json
{
  "event_type": "GOAL_ACHIEVED",
  "recipient_email": "ramirorodcas.dev@gmail.com",
  "data": {
    "org_name" : "Organizacion muy muy altruista",
    "campaign_name" : "Campaña donativa 'todos x colombia'",
    "goal_type" : "item",
    "item_name" : "Agua mineral",
    "goal_reached" : "5000",
    "goal" : "10000"
  }
}
```

Meta de Item de campaña:
```json
{
  "event_type": "GOAL_ACHIEVED",
  "recipient_email": "ramirorodcas.dev@gmail.com",
  "data": {
    "org_name" : "Organizacion muy muy altruista",
    "campaign_name" : "Campaña donativa 'todos x colombia'",
    "goal_type" : "campaign",
    "goal_reached" : "5000",
    "goal" : "10000"
  }
}
```

``Si el caso de "event_type" no coincide con ninguno declarado en make (por ahora es el unico) se dispara el mensaje de error de la 2nda foto``