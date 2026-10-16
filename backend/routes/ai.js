import { Router } from 'express';
import { handleAiChat } from '../services/aiAgent.js';
import { ruleEngine } from '../services/ruleEngine.js';
import { assetTools } from '../tools/assetTools.js';
import { purchaseTools } from '../tools/purchaseTools.js';
import { vendorTools } from '../tools/vendorTools.js';
import { departmentTools } from '../tools/departmentTools.js';
import { analyticsTools } from '../tools/analyticsTools.js';
import { getPool } from '../db.js';

const router = Router();

// 1. Main AI Chat Endpoint (Agent Mode with Automatic Token & Rule Fallback)
router.post('/chat', async (req, res) => {
  try {
    const { prompt, user, conversationHistory } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const response = await handleAiChat({
      prompt: prompt.trim(),
      user: user || { id: 'USR-GUEST', name: 'Campus User', role: 'faculty' },
      conversationHistory: conversationHistory || []
    });

    res.json(response);
  } catch (error) {
    console.error('AI chat endpoint critical error:', error);
    // Even if route crashes, return graceful rule fallback
    try {
      const fallback = await ruleEngine.executeRule(req.body?.prompt || 'help', req.body?.user?.role || 'faculty');
      res.json({
        ...fallback,
        mode: 'rule',
        reason: 'Emergency system recovery'
      });
    } catch (e) {
      res.status(500).json({ error: 'AI Assistant temporarily unavailable.' });
    }
  }
});

// 2. Direct Rule Query Endpoint
router.post('/rule-query', async (req, res) => {
  try {
    const { prompt, userRole = 'superadmin' } = req.body;
    const response = await ruleEngine.executeRule(prompt, userRole);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Controlled Safe Tool APIs for AI / Frontend Consumption
router.get('/assets/search', async (req, res) => {
  try {
    const { query, category, department, condition, limit } = req.query;
    const data = await assetTools.searchAssets({ query, category, department, condition, limit });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/purchases/stats', async (req, res) => {
  try {
    const { year, from, to } = req.query;
    const data = await purchaseTools.getPurchaseStats({ year, from, to });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vendors/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await vendorTools.getTopVendors({ limit: parseInt(limit, 10) });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/departments/summary', async (req, res) => {
  try {
    const data = await departmentTools.getDepartmentStats();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/summary', async (req, res) => {
  try {
    const { timeframe, department } = req.query;
    const data = await analyticsTools.getFullAnalytics({ timeframe, department });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. AI Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const pool = getPool();
    const limit = parseInt(req.query.limit || '50', 10);
    const [rows] = await pool.query(`SELECT * FROM ai_audit_logs ORDER BY created_at DESC LIMIT ?`, [limit]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
