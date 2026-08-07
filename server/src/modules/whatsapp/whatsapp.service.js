import { prisma } from '../../prisma/client.js';
import { createComplaint, getComplaintById } from '../complaints/complaint.service.js';
import { normalizePhoneForUser, twilioTextResponse } from '../../services/whatsapp.service.js';

function makeEmailFromPhone(phone) {
  return `${phone.replace(/[^\d]/g, '')}@whatsapp.local`;
}

function phoneVariants(phone) {
  const compact = String(phone || '').replace(/[^\d+]/g, '');
  const withoutPlus = compact.replace(/^\+/, '');
  return Array.from(
    new Set([
      compact,
      withoutPlus,
      `+${withoutPlus}`,
      `whatsapp:${compact}`,
      `whatsapp:+${withoutPlus}`,
    ].filter(Boolean)),
  );
}

async function findOrCreateWhatsAppUser(phone) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: phoneVariants(phone).map((value) => ({ phone: value })),
    },
    orderBy: { createdAt: 'asc' },
  });

  if (existingUser) {
    if (existingUser.phone !== phone) {
      return prisma.user.update({
        where: { id: existingUser.id },
        data: { phone },
      });
    }
    return existingUser;
  }

  const email = makeEmailFromPhone(phone);
  return prisma.user.upsert({
    where: { email },
    update: { phone },
    create: {
      name: `WhatsApp Citizen ${phone.slice(-4)}`,
      email,
      phone,
      passwordHash: 'WHATSAPP_INTAKE_USER',
      role: 'CITIZEN',
    },
  });
}

export async function handleIncomingWhatsApp({ from, body }) {
  const phone = normalizePhoneForUser(from);
  const text = String(body || '').trim();

  if (!phone || !text) {
    return twilioTextResponse('Please send a valid complaint message.');
  }

  const statusMatch = text.match(/^status\s+([0-9a-f-]{20,})/i);
  if (statusMatch) {
    const complaint = await getComplaintById(statusMatch[1], { role: 'admin' });
    return twilioTextResponse(
      [
        `Tracking ID: ${complaint.id}`,
        `Status: ${complaint.status}`,
        `Priority: ${complaint.priority}`,
        `Department: ${complaint.department?.name || 'Pending routing'}`,
      ].join('\n'),
    );
  }

  const user = await findOrCreateWhatsAppUser(phone);

  const complaint = await createComplaint(
    {
      title: text.length > 80 ? `${text.slice(0, 77)}...` : text,
      description: [`Source: WhatsApp`, `Phone: ${phone}`, `Description: ${text}`].join('\n'),
      category: 'WhatsApp Intake',
      priority: 'medium',
      source: 'whatsapp',
    },
    user.id,
    { notifyWhatsApp: false },
  );

  return twilioTextResponse(
    [
      'Complaint received via WhatsApp.',
      `Tracking ID: ${complaint.id}`,
      `Priority: ${complaint.prediction?.priority || complaint.priority}`,
      `Status: ${complaint.status}`,
      '',
      `Send: status ${complaint.id}`,
      'to check updates.',
    ].join('\n'),
  );
}
