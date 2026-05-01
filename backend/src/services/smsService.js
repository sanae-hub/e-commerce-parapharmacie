import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const isConfigured = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER
  && TWILIO_ACCOUNT_SID !== 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

let client = null;
if (isConfigured) {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log('✅ Service SMS Twilio initialisé.');
} else {
  console.warn('⚠️ Twilio non configuré dans .env. Mode simulation SMS activé.');
}

const formatPhone = (phone) => {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('0')) clean = '+212' + clean.substring(1);
  else if (!clean.startsWith('+')) clean = '+' + clean;
  return clean;
};

const sendSMS = async (to, body) => {
  const phone = formatPhone(to);
  if (!phone) return;

  if (!isConfigured) {
    console.log(`[SMS MOCK] À ${phone}: ${body}`);
    return;
  }

  try {
    await client.messages.create({ from: TWILIO_PHONE_NUMBER, to: phone, body });
    console.log(`📱 ✅ SMS envoyé à ${phone}`);
  } catch (error) {
    console.error(`📱 ❌ Erreur SMS Twilio pour ${phone}:`, error.message);
  }
};

const STATUS_LABELS = {
  RECEIVED: 'bien reçue ✅',
  RECUE: 'bien reçue ✅',
  PREPARING: 'en cours de préparation 🔧',
  PRETE: 'prête à être récupérée 🎉',
  READY: 'prête à être récupérée 🎉',
  COMPLETED: 'livrée/terminée ✅',
  ANNULEE: 'annulée ❌',
  CANCELLED: 'annulée ❌',
};

export const sendSmsOrderCreated = async (phone, order, client) => {
  if (!phone) return;
  const firstName = client?.firstName || 'Client';
  const body = `ParaClick - Bonjour ${firstName}, votre commande n°${order.orderNumber} a bien été reçue. Montant: ${order.total} DH. Merci !`;
  await sendSMS(phone, body);
};

export const sendSmsOrderStatus = async (phone, order, newStatus, client) => {
  if (!phone) return;
  const firstName = client?.firstName || 'Client';
  const label = STATUS_LABELS[newStatus] || newStatus;
  const body = `ParaClick - Bonjour ${firstName}, votre commande n°${order.orderNumber} est ${label}.`;
  await sendSMS(phone, body);
};

export const sendSmsReminder = async (phone, order, client) => {
  if (!phone) return;
  const firstName = client?.firstName || 'Client';
  const body = `ParaClick - Rappel : Bonjour ${firstName}, votre commande n°${order.orderNumber} est à récupérer à ${order.timeSlotStart}. À tout à l'heure !`;
  await sendSMS(phone, body);
};
