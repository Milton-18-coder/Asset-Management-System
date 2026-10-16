import { Router } from 'express';
import { generateAnalyticsPDF, generatePurchaseHistoryPDF } from '../services/pdfService.js';
import { sendReportEmail } from '../services/emailService.js';
import { sendWhatsAppReport } from '../services/whatsappService.js';
import { analyticsTools } from '../tools/analyticsTools.js';
import { purchaseTools } from '../tools/purchaseTools.js';
import { getPool } from '../db.js';

const router = Router();

// 1. GET / POST Analytics PDF Download
router.get('/analytics/pdf', async (req, res) => {
  try {
    const { timeframe = 'all', department = 'All' } = req.query;
    const analyticsData = await analyticsTools.getFullAnalytics({ timeframe, department });
    const pdfBuffer = await generateAnalyticsPDF({ timeframe, department, data: analyticsData });

    const filename = `AssetMS_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Analytics PDF generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Analytics PDF report.' });
  }
});

// 2. GET / POST Purchase History PDF Download
router.get('/purchases/pdf', async (req, res) => {
  try {
    const { category, vendor, from, to, search } = req.query;
    const pool = getPool();

    let sql = 'SELECT * FROM purchase_history WHERE 1=1';
    const params = [];

    if (from) {
      sql += ' AND purchaseDate >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND purchaseDate <= ?';
      params.push(to);
    }
    if (category && category !== 'All') {
      sql += ' AND categoryName = ?';
      params.push(category);
    }
    if (vendor && vendor !== 'All') {
      sql += ' AND (vendorName = ? OR vendorId = ?)';
      params.push(vendor, vendor);
    }
    if (search) {
      sql += ' AND (assetName LIKE ? OR vendorName LIKE ? OR invoiceNumber LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY purchaseDate DESC LIMIT 1000';
    const [purchases] = await pool.query(sql, params);

    const pdfBuffer = await generatePurchaseHistoryPDF({
      purchases,
      filterSummary: {
        category: category || 'All',
        vendor: vendor || 'All',
        dateRange: from || to ? `${from || 'Start'} to ${to || 'End'}` : 'All Time'
      }
    });

    const filename = `AssetMS_Purchase_History_${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Purchase History PDF generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Purchase History PDF report.' });
  }
});

// 3. POST Share Report via Email
router.post('/email', async (req, res) => {
  try {
    const { to, subject, message, attachPdf, reportType = 'analytics', filterParams = {} } = req.body;

    if (!to || !to.includes('@')) {
      return res.status(400).json({ error: 'A valid recipient email address is required.' });
    }

    let pdfBuffer = null;
    let filename = `AssetMS_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

    if (attachPdf) {
      if (reportType === 'purchases') {
        const pool = getPool();
        const [purchases] = await pool.query('SELECT * FROM purchase_history ORDER BY purchaseDate DESC LIMIT 500');
        pdfBuffer = await generatePurchaseHistoryPDF({ purchases, filterSummary: filterParams });
        filename = `AssetMS_Purchase_History_${new Date().toISOString().slice(0, 10)}.pdf`;
      } else {
        const analyticsData = await analyticsTools.getFullAnalytics({
          timeframe: filterParams.timeframe || 'all',
          department: filterParams.department || 'All'
        });
        pdfBuffer = await generateAnalyticsPDF({
          timeframe: filterParams.timeframe || 'All',
          department: filterParams.department || 'All',
          data: analyticsData
        });
        filename = `AssetMS_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      }
    }

    const result = await sendReportEmail({
      to,
      subject,
      message,
      pdfBuffer,
      filename
    });

    res.json(result);
  } catch (error) {
    console.error('Email report sharing route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST Share Report via WhatsApp
router.post('/whatsapp', async (req, res) => {
  try {
    const { phone, message, summaryData } = req.body;

    if (!phone || phone.trim().length < 6) {
      return res.status(400).json({ error: 'A valid recipient mobile phone number is required.' });
    }

    const result = await sendWhatsAppReport({
      phone,
      message,
      summaryData
    });

    res.json(result);
  } catch (error) {
    console.error('WhatsApp report sharing route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
