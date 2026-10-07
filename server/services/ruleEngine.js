import { assetTools } from '../tools/assetTools.js';
import { purchaseTools } from '../tools/purchaseTools.js';
import { vendorTools } from '../tools/vendorTools.js';
import { departmentTools } from '../tools/departmentTools.js';
import { analyticsTools } from '../tools/analyticsTools.js';
import { maintenanceTools } from '../tools/maintenanceTools.js';
import { inspectionTools } from '../tools/inspectionTools.js';

export const ruleEngine = {
  /**
   * Detect intent and extract parameters from natural language prompt
   */
  detectIntent(prompt = '') {
    const text = prompt.toLowerCase().trim();

    // 1. Report generation intents
    if (
      text.includes('generate') ||
      text.includes('export') ||
      text.includes('download') ||
      text.includes('create report') ||
      text.includes('send report')
    ) {
      if (text.includes('procurement') || text.includes('purchase')) {
        const yearMatch = text.match(/\b(202[0-9])\b/);
        return { intent: 'REPORT_GENERATION', type: 'purchase', year: yearMatch ? yearMatch[1] : null };
      }
      if (text.includes('analytics') || text.includes('intelligence')) {
        const yearMatch = text.match(/\b(202[0-9])\b/);
        return { intent: 'REPORT_GENERATION', type: 'analytics', year: yearMatch ? yearMatch[1] : null };
      }
      return { intent: 'REPORT_GENERATION', type: 'analytics' };
    }

    // 2. Vendor ranking and spending
    if (
      (text.includes('vendor') || text.includes('supplier')) &&
      (text.includes('highest') || text.includes('top') || text.includes('most') || text.includes('spent') || text.includes('ranking') || text.includes('largest'))
    ) {
      return { intent: 'TOP_VENDOR' };
    }

    if (text.includes('vendor') || text.includes('supplier')) {
      return { intent: 'PURCHASE_BY_VENDOR' };
    }

    // 3. Departmental assets & ranking
    if (
      text.includes('department') &&
      (text.includes('highest') || text.includes('most') || text.includes('top') || text.includes('volume') || text.includes('largest'))
    ) {
      return { intent: 'TOP_DEPARTMENT' };
    }

    if (
      text.includes('computer science') ||
      text.includes('mechanical') ||
      text.includes('civil') ||
      text.includes('it ') ||
      text.includes('aids') ||
      text.includes('ece') ||
      text.includes('eee') ||
      text.includes('science & humanities') ||
      text.includes('admin block')
    ) {
      return { intent: 'ASSET_BY_DEPARTMENT' };
    }

    // 4. Procurement spend and purchase totals
    if (
      (text.includes('how much') || text.includes('total') || text.includes('spend') || text.includes('procurement') || text.includes('expenditure') || text.includes('cost')) &&
      (text.includes('spend') || text.includes('purchase') || text.includes('procurement') || text.includes('spent') || text.includes('invested'))
    ) {
      const yearMatch = text.match(/\b(202[0-9])\b/);
      return { intent: 'PURCHASE_TOTAL', year: yearMatch ? yearMatch[1] : null };
    }

    // 5. Purchases above certain threshold / amount
    if (text.includes('above') || text.includes('greater than') || text.includes('more than') || text.includes('>')) {
      const numMatch = text.replace(/,/g, '').match(/\d+/);
      return { intent: 'HIGH_VALUE_ASSETS', minAmount: numMatch ? parseInt(numMatch[0], 10) : 50000 };
    }

    // 6. Replacement / Damaged / Condition
    if (
      text.includes('replacement') ||
      text.includes('replace') ||
      text.includes('damaged') ||
      text.includes('broken') ||
      text.includes('poor') ||
      text.includes('condition') ||
      text.includes('eol') ||
      text.includes('expired')
    ) {
      return { intent: 'REPLACEMENT_DUE' };
    }

    // 7. Maintenance & Work orders
    if (text.includes('maintenance') || text.includes('repair') || text.includes('service') || text.includes('work order')) {
      return { intent: 'MAINTENANCE_DUE' };
    }

    // 8. Inspections
    if (text.includes('inspection') || text.includes('audit') || text.includes('inspector')) {
      return { intent: 'INSPECTION_STATUS' };
    }

    // 9. Categories & subcategories
    if (
      text.includes('furniture') ||
      text.includes('chair') ||
      text.includes('table') ||
      text.includes('desk') ||
      text.includes('electronics') ||
      text.includes('laboratory') ||
      text.includes('it hardware')
    ) {
      return { intent: 'PURCHASE_BY_CATEGORY' };
    }

    // 10. Overall asset counts / inventory size
    if (
      text.includes('how many assets') ||
      text.includes('total assets') ||
      text.includes('asset count') ||
      text.includes('registered assets') ||
      text.includes('units are registered')
    ) {
      return { intent: 'ASSET_COUNT' };
    }

    // 11. Recent transactions
    if (text.includes('recent') || text.includes('latest') || text.includes('last purchase') || text.includes('history')) {
      return { intent: 'PURCHASE_BY_DATE' };
    }

    // 12. Search / Default
    if (text.length > 2) {
      return { intent: 'ASSET_SEARCH', query: prompt };
    }

    return { intent: 'GENERAL_HELP' };
  },

  /**
   * Execute rule query and return factual real-database answer
   */
  async executeRule(prompt = '', userRole = 'superadmin') {
    const { intent, year, minAmount, query, type } = this.detectIntent(prompt);
    let toolUsed = 'general';
    let responseText = '';
    let structuredData = null;
    let reportAction = null;

    switch (intent) {
      case 'REPORT_GENERATION': {
        toolUsed = 'reportService';
        reportAction = {
          type: type || 'analytics',
          year: year || 'all',
          title: `AssetMS ${type === 'purchase' ? 'Procurement' : 'Analytics'} Report ${year || ''}`.trim()
        };
        responseText = `### 📊 Report Generation Request\n\nI have generated the configuration for your **${reportAction.title}**.\n\nYou can download the complete executive PDF report or distribute it via Email and WhatsApp using the interactive action below.`;
        break;
      }

      case 'ASSET_COUNT': {
        toolUsed = 'assetTools.getAssetCounts';
        const stats = await assetTools.getAssetCounts();
        structuredData = stats;
        responseText = `### 📦 Campus Asset Inventory Overview\n\n` +
          `• **Total Physical Units Registered:** **${Number(stats.totalPhysicalUnits).toLocaleString('en-IN')}**\n` +
          `• **Unique Asset Classifications:** ${Number(stats.totalAssetTypes).toLocaleString('en-IN')} models\n` +
          `• **Total Deployed Asset Book Value:** **₹${Number(stats.totalBookValue).toLocaleString('en-IN')}**\n\n` +
          `**Condition Status:**\n` +
          `• 🟢 **Good / Optimal:** ${Number(stats.goodConditionUnits).toLocaleString('en-IN')} units\n` +
          `• 🟡 **Fair:** ${Number(stats.fairConditionUnits).toLocaleString('en-IN')} units\n` +
          `• 🟠 **Poor:** ${Number(stats.poorConditionUnits).toLocaleString('en-IN')} units\n` +
          `• 🔴 **Damaged:** ${Number(stats.damagedConditionUnits).toLocaleString('en-IN')} units`;
        break;
      }

      case 'PURCHASE_TOTAL': {
        toolUsed = 'purchaseTools.getPurchaseStats';
        const stats = await purchaseTools.getPurchaseStats({ year });
        structuredData = stats;
        const period = year ? `in ${year}` : 'to date';
        responseText = `### 💰 Total Procurement Expenditure (${year || 'Consolidated'})\n\n` +
          `Total procurement expenditure ${period} is **₹${Number(stats.totalProcurementSpend).toLocaleString('en-IN')}** across **${stats.totalTransactions} recorded transactions**.\n\n` +
          `• **Total Physical Units Acquired:** ${Number(stats.totalUnitsPurchased).toLocaleString('en-IN')} units\n` +
          `• **Active Suppliers Utilized:** ${stats.activeSuppliersCount}\n` +
          `• **Average Unit Price:** ₹${Math.round(Number(stats.averageUnitPrice)).toLocaleString('en-IN')}`;
        break;
      }

      case 'TOP_VENDOR': {
        toolUsed = 'vendorTools.getTopVendors';
        const vendors = await vendorTools.getTopVendors({ limit: 5 });
        structuredData = vendors;
        if (vendors.length === 0) {
          responseText = 'No vendor procurement records currently found in the database.';
        } else {
          const topOne = vendors[0];
          responseText = `### 🏆 Top Supplier by Procurement Value\n\n` +
            `The vendor with the highest procurement capital is **${topOne.vendorName}** with a cumulative spend of **₹${Number(topOne.totalProcurementValue).toLocaleString('en-IN')}** across ${topOne.transactionCount} transactions (${topOne.totalUnitsSupplied} units supplied).\n\n` +
            `**Top 5 Suppliers Ranking:**\n` +
            vendors.map((v, i) => `${i + 1}. **${v.vendorName}** — **₹${Number(v.totalProcurementValue).toLocaleString('en-IN')}** (${v.totalUnitsSupplied} units)`).join('\n');
        }
        break;
      }

      case 'TOP_DEPARTMENT': {
        toolUsed = 'departmentTools.getTopDepartment';
        const result = await departmentTools.getTopDepartment();
        structuredData = result;
        if (!result || !result.topByVolume) {
          responseText = 'Departmental inventory data is currently being populated.';
        } else {
          responseText = `### 🏛️ Departmental Asset Volume & Capital Analysis\n\n` +
            `• **Highest Asset Density:** **${result.topByVolume.departmentName}** with **${result.topByVolume.totalAssetUnits} physical units** (₹${Number(result.topByVolume.totalInvestedCapital).toLocaleString('en-IN')})\n` +
            `• **Highest Invested Capital:** **${result.topByCapital.departmentName}** (₹${Number(result.topByCapital.totalInvestedCapital).toLocaleString('en-IN')})\n\n` +
            `**Summary across departments:**\n` +
            result.allDepartments.slice(0, 5).map(d => `• **${d.departmentName}:** ${d.totalAssetUnits} units | ₹${Number(d.totalInvestedCapital).toLocaleString('en-IN')}`).join('\n');
        }
        break;
      }

      case 'ASSET_BY_DEPARTMENT': {
        toolUsed = 'departmentTools.getDepartmentStats';
        const allDepts = await departmentTools.getDepartmentStats();
        // find matching dept
        const promptLower = prompt.toLowerCase();
        const matched = allDepts.find(d => promptLower.includes(d.departmentName.toLowerCase()) || promptLower.includes(d.departmentCode.toLowerCase()));
        if (matched) {
          responseText = `### 🏢 ${matched.departmentName} Department Summary\n\n` +
            `• **Building Location:** ${matched.building || 'Main Campus'}\n` +
            `• **Head of Department (HOD):** ${matched.hod || 'Unassigned'}\n` +
            `• **Total Asset Units:** **${matched.totalAssetUnits} units**\n` +
            `• **Invested Capital:** **₹${Number(matched.totalInvestedCapital).toLocaleString('en-IN')}**\n` +
            `• **Condition Breakdown:** ${matched.goodConditionUnits} Good, ${matched.damagedUnits} Damaged/Needs Repair`;
        } else {
          responseText = `### 🏢 Consolidated Departmental Breakdown\n\n` +
            allDepts.map(d => `• **${d.departmentName}:** ${d.totalAssetUnits} units (₹${Number(d.totalInvestedCapital).toLocaleString('en-IN')})`).join('\n');
        }
        break;
      }

      case 'HIGH_VALUE_ASSETS': {
        toolUsed = 'assetTools.getHighValueAssets';
        const minVal = minAmount || 50000;
        const assets = await assetTools.getHighValueAssets({ minCost: minVal, limit: 8 });
        structuredData = assets;
        if (assets.length === 0) {
          responseText = `No individual assets currently found with unit cost above ₹${minVal.toLocaleString('en-IN')}.`;
        } else {
          responseText = `### 💎 High-Value Assets (Above ₹${minVal.toLocaleString('en-IN')})\n\n` +
            `Found **${assets.length} high-value assets** registered in the system:\n\n` +
            assets.map(a => `• **${a.name}** (${a.department || 'Campus'}) — **₹${Number(a.cost).toLocaleString('en-IN')}** each (Qty: ${a.quantity}, Supplier: ${a.supplier || 'OEM'})`).join('\n');
        }
        break;
      }

      case 'REPLACEMENT_DUE': {
        toolUsed = 'assetTools.getAssetsNeedingReplacement';
        const assets = await assetTools.getAssetsNeedingReplacement({ limit: 10 });
        structuredData = assets;
        if (assets.length === 0) {
          responseText = `✅ **All campus assets are in Good / Fair operating condition.** No replacement or urgent inspection requests are currently overdue.`;
        } else {
          const totalUnits = assets.reduce((s, a) => s + (a.quantity || 1), 0);
          responseText = `### ⚠️ Assets Requiring Replacement or Immediate Maintenance\n\n` +
            `Identified **${totalUnits} units across ${assets.length} equipment entries** flagged as Poor, Damaged, or Awaiting Inspection:\n\n` +
            assets.map(a => `• **${a.name}** [ID: ${a.id}] — Condition: **${a.condition}** | Status: **${a.status}** | Dept: ${a.department || 'Campus'}`).join('\n');
        }
        break;
      }

      case 'MAINTENANCE_DUE': {
        toolUsed = 'maintenanceTools.getMaintenanceSummary';
        const data = await maintenanceTools.getMaintenanceSummary();
        structuredData = data;
        responseText = `### 🛠️ Maintenance & Work Order Status\n\n` +
          `• **Total Recorded Service Logs:** ${data.summary.totalMaintenanceLogs}\n` +
          `• **Scheduled & In Progress:** **${(Number(data.summary.scheduledCount) + Number(data.summary.inProgressCount))} active tickets**\n` +
          `• **Completed Repairs:** ${data.summary.completedCount}\n` +
          `• **Cumulative Maintenance Spend:** ₹${Number(data.summary.totalMaintenanceExpense).toLocaleString('en-IN')}\n\n` +
          (data.recentLogs.length > 0 ? `**Recent Service Orders:**\n` + data.recentLogs.slice(0, 4).map(l => `• **${l.furniture}** — Status: **${l.status}** (${l.issueDescription || 'Routine overhaul'})`).join('\n') : '');
        break;
      }

      case 'INSPECTION_STATUS': {
        toolUsed = 'inspectionTools.getInspectionSummary';
        const data = await inspectionTools.getInspectionSummary();
        structuredData = data;
        responseText = `### 📋 Campus Audit & Inspection Summary\n\n` +
          `• **Total Audits Conducted:** ${data.summary.totalInspections}\n` +
          `• **Verified Good:** ${data.summary.goodCount}\n` +
          `• **Deficiencies / Poor / Damaged:** ${(Number(data.summary.poorCount) + Number(data.summary.damagedCount))}\n\n` +
          (data.recent.length > 0 ? `**Latest Inspection Records:**\n` + data.recent.slice(0, 4).map(r => `• **${r.furniture}** (${r.location}) — Condition: **${r.condition}** by ${r.inspector}`).join('\n') : '');
        break;
      }

      case 'PURCHASE_BY_CATEGORY': {
        toolUsed = 'purchaseTools.getCategoryPurchases';
        const categories = await purchaseTools.getCategoryPurchases();
        structuredData = categories;
        responseText = `### 🏷️ Category-Wise Procurement Spend\n\n` +
          categories.map(c => `• **${c.categoryName}:** **₹${Number(c.totalSpend).toLocaleString('en-IN')}** across ${c.transactionCount} orders (${c.unitsPurchased} units)`).join('\n');
        break;
      }

      case 'PURCHASE_BY_DATE': {
        toolUsed = 'purchaseTools.searchPurchases';
        const purchases = await purchaseTools.searchPurchases({ limit: 6 });
        structuredData = purchases;
        responseText = `### 🕒 Recent Procurement Transactions\n\n` +
          purchases.map(p => `• **${p.purchaseDate}** — **${p.assetName}** (${p.quantity} units @ ₹${Number(p.purchasePrice).toLocaleString('en-IN')}) from **${p.vendorName}** [Invoice: ${p.invoiceNumber || 'N/A'}]`).join('\n');
        break;
      }

      case 'ASSET_SEARCH': {
        toolUsed = 'assetTools.searchAssets';
        const searchResults = await assetTools.searchAssets({ query, limit: 8 });
        structuredData = searchResults;
        if (searchResults.length === 0) {
          responseText = `No asset records matched your search keyword "${query}". Try searching by category, department, or supplier name.`;
        } else {
          responseText = `### 🔍 Asset Search Results for "${query}"\n\n` +
            `Found **${searchResults.length} matching asset models**:\n\n` +
            searchResults.map(a => `• **${a.name}** [${a.id}] — Dept: **${a.department || 'Campus'}**, Condition: ${a.condition}, Qty: ${a.quantity}, Cost: ₹${Number(a.cost).toLocaleString('en-IN')}`).join('\n');
        }
        break;
      }

      default: {
        toolUsed = 'assetTools.getAssetCounts';
        const counts = await assetTools.getAssetCounts();
        responseText = `### 🤖 AssetMS Intelligence Assistant\n\n` +
          `AssetMS is actively managing **${Number(counts.totalPhysicalUnits).toLocaleString('en-IN')} physical assets** valued at **₹${Number(counts.totalBookValue).toLocaleString('en-IN')}**.\n\n` +
          `Here are a few questions you can ask me:\n` +
          `• *"What is our total procurement spend?"*\n` +
          `• *"Which vendor has the highest purchase value?"*\n` +
          `• *"Which department has the most assets?"*\n` +
          `• *"Show purchases above ₹50,000."*\n` +
          `• *"Which assets need replacement?"*\n` +
          `• *"Generate procurement report."*`;
        break;
      }
    }

    return {
      success: true,
      mode: 'rule',
      intent,
      toolUsed,
      responseText,
      structuredData,
      reportAction
    };
  }
};
