# Server

## WhatsApp complaint registration

Incoming WhatsApp complaints are handled through Twilio at:

```text
POST /api/whatsapp/webhook
```

Set this as the Twilio WhatsApp Sandbox or WhatsApp sender webhook URL:

```text
https://<your-public-backend-url>/api/whatsapp/webhook
```

Required environment variables:

```text
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

For local development, expose the server with a tunnel such as ngrok and use that public URL in Twilio. A citizen can then send any complaint text on WhatsApp; the server creates a complaint and replies with the tracking ID.

Quick route check:

```text
GET /api/whatsapp/health
```

Manual JSON test:

```bash
curl -X POST http://localhost:5000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d "{\"from\":\"+919999999999\",\"message\":\"Street light is not working near my house\"}"
```
