import dotenv from 'dotenv';
import { getPool } from '../db.js';

dotenv.config();

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';

/**
 * Check if WhatsApp Cloud API credentials are configured
 */
export function isWhatsAppConfigured() {
  return Boolean(
    WHATSAPP_ACCESS_TOKEN &&
    WHATSAPP_ACCESS_TOKEN !== 'your_whatsapp_token_here' &&
    WHATSAPP_PHONE_NUMBER_ID
  );
}

/**
 * Send WhatsApp Report Summary via Meta Cloud API
 */
export async function sendWhatsAppReport({ phone, message, summaryData = {} }) {
  if (!isWhatsAppConfigured()) {
    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO notifications (id, title, message, time, \`read\`, type, link)
         VALUES (?, ?, ?, ?, 0, 'whatsapp', '/analytics')`,
        [
          `NOTIF-WA-${Date.now()}`,
          'WhatsApp Service Not Configured',
          `Attempted to share report with ${phone}, but WhatsApp Cloud API credentials are not configured in environment variables.`,
          'Just now'
        ]
      );
    } catch (e) {
      // non-blocking
    }

    return {
      success: false,
      configured: false,
      message: 'WhatsApp service is not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in the server .env file.'
    };
  }

  // Format phone number (remove spaces/dashes)
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message || `AssetMS Campus Report\n\nTotal Procurement: ₹${Number(summaryData.totalCapital || 0).toLocaleString('en-IN')}\nTransactions: ${summaryData.totalTransactions || 0}\nUnits: ${summaryData.totalAssets || 0}\nReport Date: ${new Date().toLocaleDateString('en-IN')}`
        }
      })
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.error?.message || `WhatsApp API error ${response.status}`);
    }

    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO notifications (id, title, message, time, \`read\`, type, link)
         VALUES (?, ?, ?, ?, 0, 'whatsapp', '/analytics')`,
        [
          `NOTIF-WA-${Date.now()}`,
          'Report Shared via WhatsApp',
          `Report summary delivered to +${cleanPhone}.`,
          'Just now'
        ]
      );
    } catch (e) {
      // non-blocking
    }

    return {
      success: true,
      configured: true,
      messageId: resData.messages?.[0]?.id,
      message: `WhatsApp message successfully dispatched to +${cleanPhone}.`
    };

  } catch (error) {
    console.error('WhatsApp dispatch error:', error);

    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO notifications (id, title, message, time, \`read\`, type, link)
         VALUES (?, ?, ?, ?, 0, 'whatsapp', '/analytics')`,
        [
          `NOTIF-WA-${Date.now()}`,
          'WhatsApp Delivery Failed',
          `Failed to deliver report to +${cleanPhone}: ${error.message}`,
          'Just now'
        ]
      );
    } catch (e) {
      // non-blocking
    }

    return {
      success: false,
      configured: true,
      error: error.message,
      message: `Failed to dispatch WhatsApp message: ${error.message}`
    };
  }
}
