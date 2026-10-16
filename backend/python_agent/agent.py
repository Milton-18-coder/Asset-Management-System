import os
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from .config import config
from .tools import AGENT_TOOLS

SYSTEM_INSTRUCTION = """You are the AssetMS AI Master Autonomous Agent with direct, read-only SQL query access to the live MySQL database for institutional Campus Furniture & Asset Management.

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

Tool Capabilities:
- query_database(sql_query="SELECT ..."): Run ANY SQL SELECT statement on MySQL for custom groupings, calculations, joins, lookups, and statistics.
- search_assets, get_asset_statistics, get_department_summary, get_top_vendors, get_purchase_statistics, get_replacement_candidates, get_maintenance_summary.

Instructions:
1. You can answer ANY question about the database by executing SQL queries via `query_database` or calling the domain tools.
2. Format all answers in clean Markdown with bold figures, bullet points, and tables.
3. Currency is in Indian Rupees (₹ / INR).
"""

class GeminiAssetAgent:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or config.GEMINI_API_KEY
        self.model = model or config.GEMINI_MODEL
        self.client = None
        self.chat_session = None
        self._init_client()

    def _init_client(self):
        if not self.api_key or self.api_key == "your_ai_api_key_here":
            print("[Agent Warning] No valid Gemini API key found. Please set GEMINI_API_KEY or AI_API_KEY in .env.")
            return

        try:
            self.client = genai.Client(api_key=self.api_key)
            self._start_new_chat()
            print(f"[Agent Ready] Connected to Google GenAI using model: {self.model}")
        except Exception as e:
            print(f"[Agent Error] Initialization error: {e}")

    def _start_new_chat(self):
        if not self.client:
            return
        candidate_models = [self.model, 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-2.5-flash']
        # Remove duplicates while preserving order
        candidate_models = list(dict.fromkeys(candidate_models))
        
        for m in candidate_models:
            try:
                self.chat_session = self.client.chats.create(
                    model=m,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        tools=AGENT_TOOLS,
                        temperature=0.2,
                    )
                )
                self.model = m
                return
            except Exception as e:
                continue
        print("[Agent Error] Could not create chat session with candidate models.")

    def reset_chat(self):
        """Clear conversation history and start fresh session."""
        self._start_new_chat()

    def _fallback_tool_response(self, prompt: str) -> str:
        """Intelligent direct tool fallback when AI quota is exhausted."""
        p = prompt.lower().strip()
        from .tools import (
            get_department_summary,
            get_purchase_statistics,
            get_asset_statistics,
            get_top_vendors,
            get_replacement_candidates,
            get_maintenance_summary,
            search_assets
        )
        import json

        if "department" in p or "dept" in p or "branch" in p:
            data = json.loads(get_department_summary())
            depts = data.get("departments", [])
            total_assets = sum(int(d.get("assetCount", 0)) for d in depts)
            total_val = sum(float(d.get("totalValue", 0)) for d in depts)
            lines = [f"### 🏛️ Campus Department Overview ({len(depts)} Registered Departments)\n",
                     f"The college comprises **{len(depts)} departments** managing **{total_assets} total assets** valued at **₹{total_val:,.2f}**.\n\n**Departmental Breakdown:**"]
            for i, d in enumerate(depts, 1):
                lines.append(f"{i}. **{d.get('department')}**\n   • Total Assets: **{d.get('assetCount')} units** | Capital: **₹{float(d.get('totalValue', 0)):,.2f}**")
            return "\n".join(lines)

        if any(w in p for w in ["spend", "spent", "spended", "procurement", "expenditure", "cost", "budget", "amount"]):
            data = json.loads(get_purchase_statistics())
            spend = float(data.get("totalSpend", 0))
            orders = data.get("totalOrders", 0)
            units = data.get("totalUnits", 0)
            return (f"### 💰 Total Procurement Expenditure\n\n"
                    f"Total procurement expenditure is **₹{spend:,.2f}** across **{orders} recorded orders**.\n\n"
                    f"• **Total Units Procured:** **{units} units**\n"
                    f"• **Average Order Value:** ₹{(spend/orders if orders else 0):,.2f}")

        if any(w in p for w in ["damaged", "poor", "broken", "repair", "replace", "condition"]):
            data = json.loads(get_replacement_candidates())
            candidates = data.get("candidates", [])
            lines = [f"### ⚠️ Assets in Poor / Damaged Condition ({len(candidates)} Identified)\n"]
            for i, c in enumerate(candidates, 1):
                lines.append(f"{i}. **{c.get('name')}** [`{c.get('id')}`]\n   • Location: **{c.get('department')}** ({c.get('room')})\n   • Condition: **{c.get('condition')}** | Cost: ₹{float(c.get('cost', 0)):,.2f}")
            return "\n".join(lines)

        if any(w in p for w in ["vendor", "supplier", "dealer"]):
            data = json.loads(get_top_vendors())
            vendors = data.get("top_vendors", [])
            lines = [f"### 🏆 Top Institutional Suppliers\n"]
            for i, v in enumerate(vendors, 1):
                lines.append(f"{i}. **{v.get('vendorName')}** — **₹{float(v.get('totalSpend', 0)):,.2f}** ({v.get('orderCount')} orders)")
            return "\n".join(lines)

        if any(w in p for w in ["how many", "count", "inventory", "total asset", "total item"]):
            data = json.loads(get_asset_statistics())
            return (f"### 📦 Campus Inventory Summary\n\n"
                    f"• **Total Registered Assets:** **{data.get('totalAssets', 0)}**\n"
                    f"• **Total Book Valuation:** **₹{float(data.get('totalValuation', 0)):,.2f}**\n\n"
                    f"**Condition Status:**\n"
                    f"• 🟢 Good: **{data.get('goodCondition', 0)}**\n"
                    f"• 🟡 Fair: **{data.get('fairCondition', 0)}**\n"
                    f"• 🟠 Poor: **{data.get('poorCondition', 0)}**\n"
                    f"• 🔴 Damaged: **{data.get('damagedCondition', 0)}**")

        # General search fallback
        data = json.loads(search_assets(query=prompt, limit=5))
        assets = data.get("assets", [])
        if assets:
            lines = [f"### 🔍 Matching Asset Records ({len(assets)} found)\n"]
            for a in assets:
                lines.append(f"• **{a.get('name')}** [`{a.get('id')}`] — {a.get('department')} ({a.get('condition')})")
            return "\n".join(lines)

        return (f"### ℹ️ Campus Asset Knowledge Base\n\n"
                f"I can help you query:\n"
                f"• **Departments**: 'How many departments in the college'\n"
                f"• **Procurement Spend**: 'Total spend amount' or 'Top vendors'\n"
                f"• **Condition Audits**: 'How many assets are damaged' or 'Replacement candidates'\n"
                f"• **Inventory Counts**: 'Total asset statistics'")

    def chat(self, user_message: str) -> Dict[str, Any]:
        """
        Send a user message to the agent and receive a response.
        The agent autonomously calls required tools and returns the synthesized answer.
        """
        if not self.client or not self.chat_session:
            # Direct database fallback when no API key configured
            fallback_text = self._fallback_tool_response(user_message)
            return {
                "response": fallback_text,
                "tools_used": ["database_tool"],
                "status": "success"
            }

        try:
            # Send message to active chat session with automatic function calling enabled
            response = self.chat_session.send_message(user_message)
            reply_text = response.text or ""
            
            tools_used = []
            if hasattr(response, 'function_calls') and response.function_calls:
                for fc in response.function_calls:
                    tools_used.append({
                        "name": getattr(fc, 'name', 'unknown'),
                        "args": getattr(fc, 'args', {})
                    })

            return {
                "response": reply_text,
                "tools_used": tools_used,
                "model": self.model,
                "status": "success"
            }
        except Exception as e:
            err_msg = str(e)
            print(f"[Agent Notice] Primary model error ({err_msg[:80]}...). Using direct database tool fallback.")
            
            # Execute instant direct database tool fallback
            fallback_text = self._fallback_tool_response(user_message)
            return {
                "response": fallback_text,
                "tools_used": ["direct_db_tool"],
                "model": self.model,
                "status": "success"
            }

    def run_single_prompt(self, prompt: str, system_override: Optional[str] = None) -> str:
        """One-off prompt generation without continuous chat state."""
        if not self.client:
            return self._fallback_tool_response(prompt)

        try:
            config_params = types.GenerateContentConfig(
                system_instruction=system_override or SYSTEM_INSTRUCTION,
                tools=AGENT_TOOLS,
                temperature=0.2,
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config_params
            )
            return response.text or ""
        except Exception as e:
            return self._fallback_tool_response(prompt)
