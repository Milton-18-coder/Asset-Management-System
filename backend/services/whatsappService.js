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
    !WHATSAPP_ACCESS_TOKEN.startsWith('EAAG...your_token') &&
    WHATSAPP_PHONE_NUMBER_ID &&
    WHATSAPP_PHONE_NUMBER_ID !== 'your_phone_number_id_here'
  );
}

/**
 * Normalize phone number for Meta WhatsApp Cloud API (E.164 digits without +)
 * Example: "+91 98765 43210" -> "919876543210"
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (!digits) return '';

  // 10 digits Indian mobile number -> prepend country code 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  // 11 digits starting with 0 -> replace leading 0 with 91
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Send automated WhatsApp alert for asset status/condition change
 */
export async function sendAssetStatusWhatsApp({
  phone,
  asset,
  previousCondition,
  newCondition,
  previousStatus,
  newStatus,
  updatedBy,
  direction
}) {
  const cleanPhone = normalizePhoneNumber(phone);

  if (!cleanPhone) {
    return {
      success: false,
      configured: isWhatsAppConfigured(),
      status: 'skipped',
      message: 'No valid phone number provided for WhatsApp alert'
    };
  }

  if (!isWhatsAppConfigured()) {
    return {
      success: false,
      configured: false,
      status: 'skipped',
      phone: cleanPhone,
      message: 'WhatsApp Cloud API credentials not configured in environment variables'
    };
  }

  // Format direction text
  const isDeptAdmin = direction === 'deptadmin_to_superadmin' || 
    (updatedBy?.role || '').toLowerCase().replace(/[\s_-]/g, '').includes('dept');
  const roleDisplay = isDeptAdmin ? 'Department Admin' : 'Super Admin';
  const editorName = updatedBy?.name || updatedBy?.username || (isDeptAdmin ? 'Department Admin' : 'Super Admin');

  let directionText = 'Asset Status Update';
  if (direction === 'deptadmin_to_superadmin') {
    directionText = 'Department Admin → Super Admin';
  } else if (direction === 'superadmin_to_deptadmin') {
    directionText = `Super Admin → ${asset?.department || 'Department'} Department Admin`;
  }

  // Format timestamp in Asia/Kolkata timezone
  const formattedTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date());

  const messageBody = [
    'Asset Management System',
    '',
    'Asset Status Update',
    '',
    `Asset ID: ${asset?.id || 'N/A'}`,
    `Asset Name: ${asset?.name || 'Institutional Asset'}`,
    `Department: ${asset?.department || 'General'}`,
    `Previous Condition: ${previousCondition || 'N/A'}`,
    `New Condition: ${newCondition || 'N/A'}`,
    `Updated By: ${editorName}`,
    `Role: ${roleDisplay}`,
    `Updated At: ${formattedTime} IST`
  ].join('\n');

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
          body: messageBody
        }
      })
    });

    const resData = await response.json();

    if (!response.ok) {
      const errMsg = resData.error?.message || `WhatsApp API error (${response.status})`;
      console.warn(`[Asset Notification] WhatsApp FAILED for +${cleanPhone}: ${errMsg}`);
      return {
        success: false,
        configured: true,
        status: 'failed',
        error: errMsg,
        phone: cleanPhone
      };
    }

    const messageId = resData.messages?.[0]?.id || 'OK';
    return {
      success: true,
      configured: true,
      status: 'sent',
      messageId,
      phone: cleanPhone
    };
  } catch (error) {
    console.warn(`[Asset Notification] WhatsApp FAILED for +${cleanPhone}: ${error.message}`);
    return {
      success: false,
      configured: true,
      status: 'failed',
      error: error.message,
      phone: cleanPhone
    };
  }
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
