import twilio from 'twilio';

export function normalizePhoneNumber(phone) {
  if (!phone) return null;
  const raw = String(phone).trim().replace(/^whatsapp:/i, '');
  const digitsOnly = raw.replace(/\D/g, '');

  if (!digitsOnly) return null;

  if (raw.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.length >= 11 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }

  return null;
}

function normalizeWhatsAppNumber(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);
  return normalizedPhone ? `whatsapp:${normalizedPhone}` : null;
}

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = normalizeWhatsAppNumber(process.env.TWILIO_WHATSAPP_FROM);
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || (!from && !messagingServiceSid)) {
    return null;
  }

  return {
    client: twilio(accountSid, authToken),
    from,
    messagingServiceSid,
  };
}

function mapTwilioError(error) {
  const message = error?.message || 'Twilio WhatsApp send failed';

  if (message.includes('could not find a Channel with the specified From address')) {
    return 'Twilio WhatsApp sender is not enabled on this account. Set a valid WhatsApp-enabled sender in TWILIO_WHATSAPP_FROM or use TWILIO_MESSAGING_SERVICE_SID.';
  }

  if (message.includes('has not joined the sandbox')) {
    return 'Recipient has not joined the Twilio WhatsApp sandbox yet.';
  }

  if (message.includes('The From phone number') || message.includes('Invalid From')) {
    return 'Configured Twilio WhatsApp sender is invalid.';
  }

  if (message.includes('not a valid phone number')) {
    return 'Recipient phone number is not a valid WhatsApp destination.';
  }

  return message;
}

export async function sendWhatsAppMessage(toPhone, body) {
  const config = getTwilioClient();
  const to = normalizeWhatsAppNumber(toPhone);

  if (!config || !to) {
    return { sent: false, reason: 'Twilio WhatsApp is not configured or user phone is invalid' };
  }

  try {
    const payload = config.messagingServiceSid
      ? {
          messagingServiceSid: config.messagingServiceSid,
          to,
          body,
        }
      : {
          from: config.from,
          to,
          body,
        };

    const message = await config.client.messages.create(payload);

    return { sent: true, sid: message.sid };
  } catch (error) {
    return {
      sent: false,
      reason: mapTwilioError(error),
      code: error?.code,
    };
  }
}

export async function sendComplaintConfirmation({ user, complaint, prediction }) {
  const priority = prediction?.priority || complaint.priority || 'Pending';
  const body = [
    `Hello ${user.name || 'Citizen'},`,
    '',
    'Your complaint has been submitted successfully.',
    '',
    `Tracking ID: ${complaint.id}`,
    `Title: ${complaint.title}`,
    `Priority: ${priority}`,
    `Status: ${complaint.status}`,
    '',
    'You can track updates from the Citizen Portal.',
  ].join('\n');

  return sendWhatsAppMessage(user.phone, body);
}

export function twilioTextResponse(message) {
  const response = new twilio.twiml.MessagingResponse();
  response.message(message);
  return response.toString();
}

export function normalizePhoneForUser(from) {
  return normalizePhoneNumber(from);
}
