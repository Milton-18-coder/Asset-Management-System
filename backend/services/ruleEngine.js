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
      const yearMatch = text.match(/\b(202[0-9])\b/);
      if (text.includes('procurement') || text.includes('purchase')) {
        return { intent: 'REPORT_GENERATION', type: 'purchase', year: yearMatch ? yearMatch[1] : null };
      }
      return { intent: 'REPORT_GENERATION', type: 'analytics', year: yearMatch ? yearMatch[1] : null };
    }

    // 2. Departmental queries (how many departments, list departments, specific department)
    if (
      text.includes('department') ||
      text.includes('departments') ||
      text.includes('dept') ||
      text.includes('depts') ||
      text.includes('branch') ||
      text.includes('branches')
    ) {
      if (
        text.includes('computer science') ||
        text.includes('cse') ||
        text.includes('mechanical') ||
        text.includes('civil') ||
        text.includes('it ') ||
        text.includes('aids') ||
        text.includes('ece') ||
        text.includes('eee') ||
        text.includes('science & humanities') ||
        text.includes('admin')
      ) {
        return { intent: 'ASSET_BY_DEPARTMENT' };
      }
      return { intent: 'TOP_DEPARTMENT' };
    }

    // 3. Procurement spend and total monetary amount (handles 'spended', 'spent', 'spending', 'cost', 'budget', etc.)
    if (
      text.includes('spended') ||
      text.includes('spent') ||
      text.includes('spend') ||
      text.includes('procurement') ||
      text.includes('expenditure') ||
      text.includes('financial') ||
      text.includes('budget') ||
      text.includes('invested') ||
      text.includes('total purchase') ||
      text.includes('total amount') ||
      text.includes('purchase cost') ||
      text.includes('how much')
    ) {
      const yearMatch = text.match(/\b(202[0-9])\b/);
      return { intent: 'PURCHASE_TOTAL', year: yearMatch ? yearMatch[1] : null };
    }

    // 4. Vendors and suppliers
    if (text.includes('vendor') || text.includes('supplier') || text.includes('dealer') || text.includes('distributor')) {
      return { intent: 'TOP_VENDOR' };
    }

    // 5. Replacement, Damaged, Poor condition, Repairs
    if (
      text.includes('replacement') ||
      text.includes('replace') ||
      text.includes('damaged') ||
      text.includes('broken') ||
      text.includes('poor') ||
      text.includes('faulty') ||
      text.includes('condition') ||
      text.includes('scrap') ||
      text.includes('eol') ||
      text.includes('expired')
    ) {
      return { intent: 'REPLACEMENT_DUE' };
    }

    // 6. Purchases / Assets above high threshold
    if (text.includes('above') || text.includes('greater than') || text.includes('more than') || text.includes('expensive') || text.includes('costly') || text.includes('highest cost') || text.includes('>')) {
      const numMatch = text.replace(/,/g, '').match(/\d+/);
      return { intent: 'HIGH_VALUE_ASSETS', minAmount: numMatch ? parseInt(numMatch[0], 10) : 50000 };
    }

    // 7. Maintenance & Work orders
    if (text.includes('maintenance') || text.includes('repair') || text.includes('service') || text.includes('work order') || text.includes('ticket')) {
      return { intent: 'MAINTENANCE_DUE' };
    }

    // 8. Inspections & Audits
    if (text.includes('inspection') || text.includes('audit') || text.includes('inspector') || text.includes('verifier')) {
      return { intent: 'INSPECTION_STATUS' };
    }

    // 9. Categories & subcategories
    if (
      text.includes('category') ||
      text.includes('categories') ||
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
      text.includes('how many asset') ||
      text.includes('how many items') ||
      text.includes('how many units') ||
      text.includes('total asset') ||
      text.includes('total items') ||
      text.includes('asset count') ||
      text.includes('registered asset') ||
      text.includes('inventory')
    ) {
      return { intent: 'ASSET_COUNT' };
    }

    // 11. Recent transactions
    if (text.includes('recent') || text.includes('latest') || text.includes('last purchase') || text.includes('history') || text.includes('transaction')) {
      return { intent: 'PURCHASE_BY_DATE' };
    }

    // 12. Search / Default fallback
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
        const totalUnits = Number(stats.totalPhysicalUnits) || 0;
        const totalModels = Number(stats.totalAssetTypes) || 0;
        const totalVal = Number(stats.totalBookValue) || 0;
        
        responseText = `### 📦 Campus Asset Inventory Overview\n\n` +
          `• **Total Physical Units Deployed:** **${totalUnits.toLocaleString('en-IN')} units**\n` +
          `• **Cataloged Equipment Models:** **${totalModels.toLocaleString('en-IN')} unique models**\n` +
          `• **Total Asset Book Valuation:** **₹${totalVal.toLocaleString('en-IN')}**\n\n` +
          `**Condition Distribution (${totalUnits} Total Units):**\n` +
          `• 🟢 **Good / Operational:** **${Number(stats.goodConditionUnits || 0).toLocaleString('en-IN')} units** (${Math.round(((stats.goodConditionUnits || 0) / (totalUnits || 1)) * 100)}%)\n` +
          `• 🟡 **Fair (Minor Wear):** **${Number(stats.fairConditionUnits || 0).toLocaleString('en-IN')} units**\n` +
          `• 🟠 **Poor (Needs Overhaul):** **${Number(stats.poorConditionUnits || 0).toLocaleString('en-IN')} units**\n` +
          `• 🔴 **Damaged (Immediate Action):** **${Number(stats.damagedConditionUnits || 0).toLocaleString('en-IN')} units**`;
        break;
      }

      case 'PURCHASE_TOTAL': {
        toolUsed = 'purchaseTools.getPurchaseStats';
        const stats = await purchaseTools.getPurchaseStats({ year });
        structuredData = stats;
        const period = year ? `in ${year}` : 'Consolidated (All Time)';
        const totalSpend = Number(stats.totalProcurementSpend) || 0;
        const orders = Number(stats.totalTransactions) || 0;
        const units = Number(stats.totalUnitsPurchased) || 0;
        const avgOrder = orders > 0 ? Math.round(totalSpend / orders) : 0;
        const avgUnit = units > 0 ? Math.round(totalSpend / units) : 0;

        responseText = `### 💰 Total Procurement Expenditure (${period})\n\n` +
          `• **Total Procurement Capital Invested:** **₹${totalSpend.toLocaleString('en-IN')}**\n` +
          `• **Total Purchasing Orders (Invoices):** **${orders} recorded transactions**\n` +
          `• **Total Equipment Units Acquired:** **${units.toLocaleString('en-IN')} physical units**\n` +
          `• **Active Approved Suppliers Utilized:** **${stats.activeSuppliersCount} vendors**\n` +
          `• **Average Transaction Value:** ₹${avgOrder.toLocaleString('en-IN')} per purchase order\n` +
          `• **Average Unit Procurement Cost:** ₹${avgUnit.toLocaleString('en-IN')} per physical unit`;
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
          responseText = `### 🏆 Top Institutional Suppliers Ranking\n\n` +
            `The highest volume vendor is **${topOne.vendorName}** with cumulative spend of **₹${Number(topOne.totalProcurementValue).toLocaleString('en-IN')}** across **${topOne.transactionCount} orders** (${topOne.totalUnitsSupplied} units supplied).\n\n` +
            `**Top 5 Vendors by Total Capital:**\n` +
            vendors.map((v, i) => `${i + 1}. **${v.vendorName}**\n   • **Total Spend:** **₹${Number(v.totalProcurementValue).toLocaleString('en-IN')}**\n   • **Volume:** ${v.transactionCount} orders | ${v.totalUnitsSupplied} units supplied`).join('\n\n');
        }
        break;
      }

      case 'TOP_DEPARTMENT': {
        toolUsed = 'departmentTools.getTopDepartment';
        const result = await departmentTools.getTopDepartment();
        structuredData = result;
        if (!result || !result.allDepartments || result.allDepartments.length === 0) {
          responseText = 'Departmental inventory data is currently being populated.';
        } else {
          const totalDepts = result.allDepartments.length;
          const totalCampusUnits = result.allDepartments.reduce((s, d) => s + (parseInt(d.totalAssetUnits, 10) || 0), 0);
          const totalCampusCap = result.allDepartments.reduce((s, d) => s + (parseFloat(d.totalInvestedCapital) || 0), 0);
          
          responseText = `### 🏛️ Campus Department Overview (${totalDepts} Registered Departments)\n\n` +
            `The college comprises **${totalDepts} academic and administrative departments** managing **${totalCampusUnits.toLocaleString('en-IN')} total physical asset units** with a combined capital valuation of **₹${Number(totalCampusCap).toLocaleString('en-IN')}**.\n\n` +
            `**Departmental Ranking by Asset Volume:**\n` +
            result.allDepartments.map((d, i) => `${i + 1}. **${d.departmentName}** (\`${d.departmentCode || 'DEPT'}\`)\n   • **Total Assets:** **${d.totalAssetUnits} units** (Valuation: ₹${Number(d.totalInvestedCapital).toLocaleString('en-IN')})\n   • **Location:** ${d.building || 'Campus'} | **HOD:** ${d.hod || 'Unassigned'}`).join('\n\n');
        }
        break;
      }

      case 'ASSET_BY_DEPARTMENT': {
        toolUsed = 'departmentTools.getDepartmentStats';
        const allDepts = await departmentTools.getDepartmentStats();
        const promptLower = prompt.toLowerCase();
        const matched = allDepts.find(d => promptLower.includes(d.departmentName.toLowerCase()) || promptLower.includes((d.departmentCode || '').toLowerCase()));
        if (matched) {
          responseText = `### 🏢 ${matched.departmentName} Department Inventory\n\n` +
            `• **Building Location:** ${matched.building || 'Main Campus'}\n` +
            `• **Head of Department (HOD):** ${matched.hod || 'Unassigned'}\n` +
            `• **Total Physical Units:** **${matched.totalAssetUnits} units** (${matched.uniqueAssetTypes || 0} unique models)\n` +
            `• **Invested Capital Valuation:** **₹${Number(matched.totalInvestedCapital).toLocaleString('en-IN')}**\n` +
            `• **Condition Breakdown:** ${matched.goodConditionUnits} Good / Optimal, ${matched.damagedUnits} Damaged / Needs Attention`;
        } else {
          responseText = `### 🏢 Consolidated Departmental Breakdown\n\n` +
            allDepts.map(d => `• **${d.departmentName}:** ${d.totalAssetUnits} units (₹${Number(d.totalInvestedCapital).toLocaleString('en-IN')})`).join('\n');
        }
        break;
      }

      case 'HIGH_VALUE_ASSETS': {
        toolUsed = 'assetTools.getHighValueAssets';
        const minVal = minAmount || 50000;
        const assets = await assetTools.getHighValueAssets({ minCost: minVal, limit: 10 });
        structuredData = assets;
        if (assets.length === 0) {
          responseText = `No individual assets currently found with unit cost above ₹${minVal.toLocaleString('en-IN')}.`;
        } else {
          responseText = `### 💎 High-Value Capital Assets (Unit Cost ≥ ₹${minVal.toLocaleString('en-IN')})\n\n` +
            `Found **${assets.length} high-value asset classifications** registered:\n\n` +
            assets.map((a, i) => `${i + 1}. **${a.name}** [\`${a.id}\`]\n   • **Unit Cost:** **₹${Number(a.cost).toLocaleString('en-IN')}** (Quantity: **${a.quantity || 1} units** | Total Value: **₹${Number(a.totalValue || (a.cost * (a.quantity || 1))).toLocaleString('en-IN')}**)\n   • **Department:** ${a.department || 'Campus'} (${a.room || 'General'})\n   • **Supplier:** ${a.supplier || 'OEM'}`).join('\n\n');
        }
        break;
      }

      case 'REPLACEMENT_DUE': {
        toolUsed = 'assetTools.getAssetsNeedingReplacement';
        const [counts, assets] = await Promise.all([
          assetTools.getAssetCounts(),
          assetTools.getAssetsNeedingReplacement({ limit: 20 })
        ]);
        structuredData = { counts, assets };
        
        const damagedAssets = assets.filter(a => a.condition === 'Damaged');
        const poorAssets = assets.filter(a => a.condition === 'Poor');
        
        const damagedUnits = damagedAssets.reduce((s, a) => s + (parseInt(a.quantity, 10) || 1), 0);
        const poorUnits = poorAssets.reduce((s, a) => s + (parseInt(a.quantity, 10) || 1), 0);
        const totalUnits = damagedUnits + poorUnits;

        if (totalUnits === 0) {
          responseText = `✅ **All campus assets are in Good / Fair operating condition.** No replacement or urgent maintenance is currently required.`;
        } else {
          let text = `### ⚠️ Equipment Replacement & Condition Report\n\n` +
            `Identified **${assets.length} unique equipment models** representing **${totalUnits} total physical units** needing attention:\n` +
            `• 🔴 **Damaged Assets:** **${damagedUnits} physical units** (across ${damagedAssets.length} models) — *Urgent repair/replacement required*\n` +
            `• 🟠 **Poor Condition Assets:** **${poorUnits} physical units** (across ${poorAssets.length} models) — *Overhaul/inspection recommended*\n\n`;

          if (damagedAssets.length > 0) {
            text += `#### 🔴 Damaged Equipment (${damagedUnits} Physical Units):\n`;
            damagedAssets.forEach((a, i) => {
              text += `${i + 1}. **${a.name}** [\`${a.id}\`]\n` +
                `   • **Quantity Damaged:** **${a.quantity || 1} physical units**\n` +
                `   • **Location:** ${a.department || 'Campus'} (${a.room || 'General'})\n` +
                `   • **Unit Cost:** ₹${Number(a.cost).toLocaleString('en-IN')} | **Status:** *${a.status}*\n\n`;
            });
          }

          if (poorAssets.length > 0) {
            text += `#### 🟠 Poor Condition Equipment (${poorUnits} Physical Units):\n`;
            poorAssets.forEach((a, i) => {
              text += `${i + 1}. **${a.name}** [\`${a.id}\`]\n` +
                `   • **Quantity in Poor Condition:** **${a.quantity || 1} physical units**\n` +
                `   • **Location:** ${a.department || 'Campus'} (${a.room || 'General'})\n` +
                `   • **Unit Cost:** ₹${Number(a.cost).toLocaleString('en-IN')} | **Status:** *${a.status}*\n\n`;
            });
          }

          responseText = text.trim();
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
