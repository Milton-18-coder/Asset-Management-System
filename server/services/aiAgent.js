import dotenv from 'dotenv';
import { getPool } from '../db.js';
import { TokenBudgetTracker, AI_MAX_TOKENS, AI_LOW_TOKEN_THRESHOLD } from './tokenBudget.js';
import { ruleEngine } from './ruleEngine.js';
import { assetTools } from '../tools/assetTools.js';
import { purchaseTools } from '../tools/purchaseTools.js';
import { vendorTools } from '../tools/vendorTools.js';
import { departmentTools } from '../tools/departmentTools.js';
import { analyticsTools } from '../tools/analyticsTools.js';
import { maintenanceTools } from '../tools/maintenanceTools.js';
import { inspectionTools } from '../tools/inspectionTools.js';

dotenv.config();

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'gemini' | 'openai' | 'local'
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || (AI_PROVIDER === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');

/**
 * Controlled Safe Tools Dictionary
 */
const TOOLS_REGISTRY = {
  getAssetCounts: async () => await assetTools.getAssetCounts(),
  searchAssets: async (args) => await assetTools.searchAssets(args),
  getHighValueAssets: async (args) => await assetTools.getHighValueAssets(args),
  getAssetsNeedingReplacement: async (args) => await assetTools.getAssetsNeedingReplacement(args),
  getPurchaseStats: async (args) => await purchaseTools.getPurchaseStats(args),
  searchPurchases: async (args) => await purchaseTools.searchPurchases(args),
  getTopVendors: async (args) => await vendorTools.getTopVendors(args),
  getDepartmentStats: async () => await departmentTools.getDepartmentStats(),
  getFullAnalytics: async (args) => await analyticsTools.getFullAnalytics(args),
  getMaintenanceSummary: async () => await maintenanceTools.getMaintenanceSummary(),
  getInspectionSummary: async () => await inspectionTools.getInspectionSummary()
};

/**
 * Log AI Activity into ai_audit_logs
 */
async function logAiActivity({ userId, userName, userRole, mode, intent, tool, status, responseTimeMs, prompt, responseSummary }) {
  try {
    const pool = getPool();
    const id = `LOG-AI-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await pool.query(
      `INSERT INTO ai_audit_logs (id, userId, userName, userRole, mode, intent, tool, status, responseTimeMs, prompt, responseSummary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId || 'ANONYMOUS',
        userName || 'User',
        userRole || 'faculty',
        mode || 'rule',
        intent || 'GENERAL_QUERY',
        tool || 'none',
        status || 'success',
        responseTimeMs || 0,
        (prompt || '').substring(0, 500),
        (responseSummary || '').substring(0, 500)
      ]
    );
  } catch (err) {
    console.warn('AI Audit log warning:', err.message);
  }
}

/**
 * Safe AI Agent Controller with Hybrid Rule-Engine Fallback
 */
export async function handleAiChat({ prompt, user = {}, conversationHistory = [] }) {
  const startTime = Date.now();
  const tokenTracker = new TokenBudgetTracker(AI_MAX_TOKENS, AI_LOW_TOKEN_THRESHOLD);

  // 1. Check if AI API Key is available
  if (!AI_API_KEY || AI_API_KEY.trim() === '' || AI_API_KEY === 'your_ai_api_key_here') {
    // Seamless Rule Fallback
    const ruleResult = await ruleEngine.executeRule(prompt, user.role);
    const responseTime = Date.now() - startTime;
    await logAiActivity({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      mode: 'rule',
      intent: ruleResult.intent,
      tool: ruleResult.toolUsed,
      status: 'fallback_no_api_key',
      responseTimeMs: responseTime,
      prompt,
      responseSummary: ruleResult.responseText
    });

    return {
      ...ruleResult,
      mode: 'rule',
      tokensUsed: 0,
      remainingTokens: AI_MAX_TOKENS,
      tokenBudgetLow: false,
      reason: 'AI service in high-speed rule mode (direct database query).'
    };
  }

  // 2. AI Agent Attempt with Token Budget Guard
  try {
    // Check initial prompt token budget
    tokenTracker.recordUsage(prompt, '');
    if (tokenTracker.isBudgetLow()) {
      console.log('Token budget already low before agent execution. Falling back to Rule Mode.');
      const ruleResult = await ruleEngine.executeRule(prompt, user.role);
      return {
        ...ruleResult,
        mode: 'rule',
        tokenBudgetLow: true,
        remainingTokens: tokenTracker.getRemainingTokens(),
        reason: 'Token budget threshold reached (preserved for reliable database lookup).'
      };
    }

    // Call AI provider (OpenAI compatible endpoint / Gemini REST endpoint)
    // First, provide safe system prompt with schema knowledge and tool list
    const systemPrompt = `You are AssetMS AI Assistant for a campus furniture and asset management system.
You answer user questions using real data. Never hallucinate numbers.
Current system tools available to inspect the real MySQL database:
- getAssetCounts(): returns physical units, condition breakdown (good/fair/poor/damaged)
- searchAssets({ query, category, department, condition, limit }): finds specific assets
- getHighValueAssets({ minCost, limit }): lists highest cost assets
- getAssetsNeedingReplacement({ limit }): finds assets in Poor/Damaged condition
- getPurchaseStats({ year, from, to }): returns total procurement spend, units, transaction count
- searchPurchases({ query, minAmount, category, vendor, year, limit }): searches purchase transactions
- getTopVendors({ limit }): ranks suppliers by total spend
- getDepartmentStats(): returns departmental asset units and invested capital
- getFullAnalytics({ timeframe, department }): full KPI analytics summary
- getMaintenanceSummary(): active maintenance work orders and costs
- getInspectionSummary(): audit inspection findings

If the user asks for factual metrics, identify which tool to use.
If you know which tool to call, output:
TOOL_CALL: toolName({"arg": "value"})

Otherwise, if you already have the data, format a helpful, concise markdown response with bullet points and bold figures.`;

    let aiResponseText = '';
    let toolCallFound = null;

    // Timeout guard (6 seconds max)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI API request timed out')), 6000)
    );

    let apiPromise;

    if (AI_PROVIDER === 'openai') {
      apiPromise = fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-4),
            { role: 'user', content: prompt }
          ],
          max_tokens: 600,
          temperature: 0.2
        })
      }).then(async res => {
        if (!res.ok) throw new Error(`OpenAI API error status: ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      });
    } else {
      // Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;
      apiPromise = fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 600
          }
        })
      }).then(async res => {
        if (!res.ok) throw new Error(`Gemini API error status: ${res.status}`);
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      });
    }

    aiResponseText = await Promise.race([apiPromise, timeoutPromise]);
    tokenTracker.recordUsage('', aiResponseText);

    // Check if remaining token budget is low after initial generation
    if (tokenTracker.isBudgetLow()) {
      console.log(`Remaining tokens low (${tokenTracker.getRemainingTokens()}). Switching to Rule Mode to complete.`);
      const ruleResult = await ruleEngine.executeRule(prompt, user.role);
      return {
        ...ruleResult,
        mode: 'rule',
        tokenBudgetLow: true,
        remainingTokens: tokenTracker.getRemainingTokens(),
        reason: 'Low token budget threshold reached: safely transitioned to Rule Engine.'
      };
    }

    // Check if AI requested a tool call (TOOL_CALL: toolName({...}))
    const toolMatch = aiResponseText.match(/TOOL_CALL:\s*([a-zA-Z0-9_]+)\((.*?)\)/);
    if (toolMatch) {
      const toolName = toolMatch[1];
      let toolArgs = {};
      try {
        if (toolMatch[2].trim()) {
          toolArgs = JSON.parse(toolMatch[2]);
        }
      } catch (e) {
        // use empty args
      }

      if (TOOLS_REGISTRY[toolName]) {
        const toolOutput = await TOOLS_REGISTRY[toolName](toolArgs);
        // Format finalized response with real data
        const ruleFormatted = await ruleEngine.executeRule(prompt, user.role);
        
        await logAiActivity({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          mode: 'agent',
          intent: ruleFormatted.intent,
          tool: toolName,
          status: 'success',
          responseTimeMs: Date.now() - startTime,
          prompt,
          responseSummary: ruleFormatted.responseText
        });

        return {
          success: true,
          mode: 'agent',
          intent: ruleFormatted.intent,
          toolUsed: toolName,
          responseText: ruleFormatted.responseText,
          structuredData: toolOutput,
          reportAction: ruleFormatted.reportAction,
          remainingTokens: tokenTracker.getRemainingTokens(),
          tokenBudgetLow: tokenTracker.isBudgetLow()
        };
      }
    }

    // If direct AI text answer generated and factual
    if (aiResponseText && !aiResponseText.includes('TOOL_CALL:')) {
      await logAiActivity({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        mode: 'agent',
        intent: 'DIRECT_RESPONSE',
        tool: 'ai_llm',
        status: 'success',
        responseTimeMs: Date.now() - startTime,
        prompt,
        responseSummary: aiResponseText
      });

      return {
        success: true,
        mode: 'agent',
        intent: 'DIRECT_RESPONSE',
        toolUsed: 'ai_llm',
        responseText: aiResponseText,
        remainingTokens: tokenTracker.getRemainingTokens(),
        tokenBudgetLow: tokenTracker.isBudgetLow()
      };
    }

    // Fallback to Rule Engine if response was incomplete
    const fallbackResult = await ruleEngine.executeRule(prompt, user.role);
    return {
      ...fallbackResult,
      mode: 'rule',
      remainingTokens: tokenTracker.getRemainingTokens(),
      tokenBudgetLow: tokenTracker.isBudgetLow()
    };

  } catch (error) {
    console.warn(`AI Agent exception (${error.message}). Automatically switching to Rule-Based Engine.`);
    const ruleResult = await ruleEngine.executeRule(prompt, user.role);
    await logAiActivity({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      mode: 'rule',
      intent: ruleResult.intent,
      tool: ruleResult.toolUsed,
      status: `fallback_${error.message.substring(0, 30)}`,
      responseTimeMs: Date.now() - startTime,
      prompt,
      responseSummary: ruleResult.responseText
    });

    return {
      ...ruleResult,
      mode: 'rule',
      remainingTokens: tokenTracker.getRemainingTokens(),
      reason: `Seamless Rule Fallback activated (${error.message}). Real database data served.`
    };
  }
}
