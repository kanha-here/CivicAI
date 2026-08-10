# Grievance Intelligence API — Model 1

FastAPI service for the ONNX grievance model. It exposes:

- `GET /` — service status
- `POST /predict` — authenticity, priority and trust-score prediction

Request:

```json
{ "complaint": "Street light is not working near the school" }
```

The ONNX weight file is intentionally excluded from Git by `.gitignore`. The deployment image must contain:

`app/models/grievance_multitask_model.onnx`

The mock application server calls this service through the `MODEL1_URL` environment variable.
