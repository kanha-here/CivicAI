import { asyncHandler } from '../../utils/asyncHandler.js';
import { handleIncomingWhatsApp } from './whatsapp.service.js';

function getIncomingMessage(body = {}) {
  return {
    from: body.From || body.from || body.WaId || body.phone || body.mobile,
    body: body.Body || body.body || body.message || body.text || body.complaint,
  };
}

export const healthHandler = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'WhatsApp complaint intake is ready',
    data: {
      webhook: '/api/whatsapp/webhook',
      accepts: ['Twilio form payload', 'JSON test payload'],
    },
  });
});

export const webhookHandler = asyncHandler(async (req, res) => {
  const xml = await handleIncomingWhatsApp(getIncomingMessage(req.body));

  res.type('text/xml').send(xml);
});
