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

import { dbTools } from '../tools/dbTools.js';

dotenv.config();

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'gemini' | 'openai' | 'local'
const AI_API_KEY = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || (AI_PROVIDER === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash');
const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://localhost:5050';

/**
 * Controlled Safe Tools Dictionary with Direct SQL Database Access
 */
const TOOLS_REGISTRY = {
  queryDatabase: async (args) => await dbTools.executeSafeQuery(typeof args === 'string' ? args : (args?.query || args?.sql)),
  getDatabaseOverview: async () => await dbTools.getDatabaseOverview(),
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
    // Comprehensive domain training & system prompt with schema & tool instructions
    const systemPrompt = `You are AssetMS AI Master Assistant, the expert autonomous agent with direct read-only SQL access to the live MySQL database for institutional Campus Furniture & Asset Management.

MySQL Database Schema (15 Tables):
1. assets(id, name, mainCategory, category, itemType, building, department, room, assignedTo, assignedRole, assignedEmail, condition['Good','Fair','Poor','Damaged'], status['Available','In Use','Needs Inspection','Under Maintenance'], purchaseDate, cost, supplier, warranty, quantity, description)
2. departments(id, name, code, building, hod, admin)
3. buildings(id, name, code, floors)
4. rooms(id, number, building, department, floor, type, capacity)
5. users(id, username, password, name, role, department, email)
6. vendors(id, name, contactPerson, email, phone, address, gstin, rating, services)
7. purchase_history(id, assetId, assetName, vendorId, vendorName, categoryId, categoryName, subcategoryId, subcategoryName, itemType, purchaseDate, purchasePrice, quantity, totalAmount, invoiceNumber, invoiceDate, warrantyExpiry, notes)
8. maintenance_logs(id, assetId, furniture, issueDescription, scheduledDate, completedDate, cost, status, vendor, technicianNotes)
9. inspections(id, assetId, furniture, location, condition, inspector, date, notes)
10. transfers(id, assetId, furniture, source, destination, requestedBy, role, department, date, status, reason)
11. disposals(id, assetId, furniture, disposalDate, reason, resaleValue, approvedBy, notes)
12. notifications(id, title, message, time, read, department, type, link)
13. audit_logs(id, userId, userName, userRole, action, entity, entityId, details)
14. categories(id, name, mainCategory, code, icon, depreciationRate, usefulLifeYears, description)

Available Live Database Tools:
1. queryDatabase({"query": "SELECT ... FROM ..."}): Executes ANY custom, read-only SQL SELECT query on MySQL. Use this for complex queries, joins, group-by, specific filters, custom metrics, and multi-table lookups!
2. searchAssets({ query, category, department, condition, limit }): Finds assets with full item records.
3. getAssetsNeedingReplacement({ limit }): Returns all items in 'Poor' or 'Damaged' condition.
4. getAssetCounts(): Returns physical units and condition counts.
5. getPurchaseStats({ year, from, to }): Returns total procurement expenditure and metrics.
6. getTopVendors({ limit }): Ranks suppliers by total spend.
7. getDepartmentStats(): Returns departmental asset distribution and capital values.
8. getMaintenanceSummary(): Active repair tickets and costs.
9. getInspectionSummary(): Recent audits and inspection ratings.

Decision & Formatting Rules:
- When the user asks ANY question about the database, either call a specialized tool or generate a precise SQL query via TOOL_CALL: queryDatabase({"query": "SELECT ..."})
- Provide clean, professional Markdown responses with bold numbers, bulleted lists, and tables.
- Currency is in Indian Rupees (₹ / INR). Never say details are not available when you can query the database.`;

    let aiResponseText = '';
    let toolCallFound = null;

    // Timeout guard (18 seconds max for smooth network latency tolerance)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI API request timed out')), 18000)
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
          max_tokens: 1000,
          temperature: 0.2
        })
      }).then(async res => {
        if (!res.ok) throw new Error(`OpenAI API error status: ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
      });
    } else {
      // Gemini API with automatic model fallback
      const callGeminiModel = async (modelToTry) => {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:generateContent?key=${AI_API_KEY}`;
        const res = await fetch(geminiUrl, {
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
              maxOutputTokens: 1000
            }
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Gemini API error status: ${res.status}`);
        }
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      };

      apiPromise = callGeminiModel(AI_MODEL)
        .catch(async (primaryErr) => {
          console.warn(`Model ${AI_MODEL} error (${primaryErr.message}). Retrying with gemini-3.5-flash...`);
          return callGeminiModel('gemini-3.5-flash');
        })
        .catch(async (secondErr) => {
          console.warn(`Model gemini-3.5-flash error (${secondErr.message}). Retrying with gemini-3.7-flash...`);
          return callGeminiModel('gemini-3.7-flash');
        });
    }

    aiResponseText = await Promise.race([apiPromise, timeoutPromise]);
    tokenTracker.recordUsage('', aiResponseText);

    // Check if AI requested a tool call (TOOL_CALL: toolName({...}))
    const toolMatch = aiResponseText.match(/TOOL_CALL:\s*([a-zA-Z0-9_]+)\(([\s\S]*?)\)/);
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
        let toolOutput = await TOOLS_REGISTRY[toolName](toolArgs);

        // Auto-enrichment: If getAssetCounts was chosen but user asks "what are they" / "damaged" / "list", also fetch the items!
        const promptLower = prompt.toLowerCase();
        if (toolName === 'getAssetCounts' && (promptLower.includes('what') || promptLower.includes('which') || promptLower.includes('list') || promptLower.includes('damaged') || promptLower.includes('poor'))) {
          try {
            const conditionFilter = promptLower.includes('poor') ? 'Poor' : (promptLower.includes('damaged') ? 'Damaged' : '');
            const extraAssets = await assetTools.searchAssets({ condition: conditionFilter, limit: 15 });
            toolOutput = {
              counts: toolOutput,
              matchingAssetItems: extraAssets
            };
          } catch (e) {
            // keep standard toolOutput
          }
        }
        
        let responseText = '';
        try {
          const synthesisUrl = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;
          const synthRes = await fetch(synthesisUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{
                    text: `You are AssetMS AI Assistant. The user asked: "${prompt}".
Here is the factual data retrieved directly from the MySQL database:
${JSON.stringify(toolOutput, null, 2)}

Instructions:
1. Provide a comprehensive, accurate, and direct response in Markdown.
2. If specific asset items are present in the data, list each item clearly with its ID, Name, Department, Room, Cost (in ₹), and Condition.
3. Use bold numbers and bullet points. Never say details are not available if items are listed above.`
                  }]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1200
              }
            })
          });
          if (synthRes.ok) {
            const synthData = await synthRes.json();
            responseText = synthData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (e) {
          console.warn('Synthesis error:', e.message);
        }

        // Fallback formatting if synthesis was empty
        if (!responseText) {
          const ruleFormatted = await ruleEngine.executeRule(prompt, user.role);
          responseText = ruleFormatted.responseText;
        }

        tokenTracker.recordUsage('', responseText);
        
        await logAiActivity({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          mode: 'agent',
          intent: toolName,
          tool: toolName,
          status: 'success',
          responseTimeMs: Date.now() - startTime,
          prompt,
          responseSummary: responseText
        });

        return {
          success: true,
          mode: 'agent',
          intent: toolName,
          toolUsed: toolName,
          responseText: responseText,
          structuredData: toolOutput,
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
