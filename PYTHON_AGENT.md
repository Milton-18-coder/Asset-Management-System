# 🤖 AssetMS Python AI Agent (Gemini 2.5 Flash)

An intelligent, autonomous AI Chatbot and Agent built in Python using the official **Google GenAI SDK** (`google-genai`) with **Gemini 2.5 Flash** and native function/tool calling.

---

## 🌟 Key Features

1. **Autonomous Tool Calling**: Gemini 2.5 Flash decides when and which database tools to invoke in real-time.
2. **Real-time MySQL Database Integration**: Directly executes parameterized, SQL queries against `assets`, `purchase_history`, `maintenance`, and `vendors` tables.
3. **Multi-Turn Memory**: Preserves context throughout the conversation session.
4. **Dual Execution Modes**:
   - **Interactive Terminal CLI**: Rich conversational command-line interface.
   - **REST API Server (Flask)**: Exposes endpoints for frontend UI integration.

---

## 🛠️ Included Agent Tools

| Tool Name | Description |
| :--- | :--- |
| `search_assets` | Search assets by keyword, category, department, or physical condition |
| `get_asset_statistics` | Fetch macro inventory statistics (units, valuation, condition breakdown) |
| `get_high_value_assets` | Retrieve top capital investments exceeding cost thresholds |
| `get_replacement_candidates` | Identify assets in *Poor* or *Damaged* condition |
| `get_purchase_statistics` | Analyze procurement expenditures and purchase volumes |
| `get_top_vendors` | Rank suppliers and vendors by total transaction value |
| `get_department_summary` | Breakdown of asset distribution and capital by campus department |
| `get_maintenance_summary` | Review open maintenance work orders and estimated costs |
| `create_maintenance_ticket` | Autonomously create a work order ticket for damaged assets |

---

## 🚀 Quickstart Guide

### 1. Configure Environment Variables
Ensure your `.env` contains your Gemini API Key and MySQL credentials:
```env
# AI Agent Key
GEMINI_API_KEY=your_gemini_api_key_here
# or AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-2.5-flash

# Database Settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=asset_management_db
```

---

### 2. Run the Interactive Chatbot (CLI Mode)

Run the Python chatbot in your terminal:
```bash
python run_agent.py
```
*Special CLI commands inside the chat:*
- `/tools` - Display all available agent tools
- `/stats` - Instant macro inventory summary
- `/reset` - Clear conversation memory
- `exit` - Quit chatbot

---

### 3. Run as a REST API Server

Start the lightweight Python server on port `5050`:
```bash
python run_agent.py --server --port 5050
```

#### API Endpoints:
- `POST http://localhost:5050/api/chat`
  ```json
  {
    "prompt": "List the top 3 highest value assets in the campus"
  }
  ```
- `GET http://localhost:5050/api/health`
- `GET http://localhost:5050/api/tools`
- `POST http://localhost:5050/api/reset`

---

## 📂 Project Structure

```
c:\Projects\Asset\
├── python_agent\
│   ├── __init__.py      # Package export
│   ├── config.py        # Environment & configuration loader
│   ├── db.py            # MySQL connector & fallback engine
│   ├── tools.py         # Agent tools & functions
│   ├── agent.py         # Gemini 2.5 Flash Agent with Google GenAI SDK
│   ├── cli.py           # Interactive terminal interface
│   └── api.py           # Flask REST API server
├── run_agent.py         # Easy one-command runner
└── PYTHON_AGENT.md      # Documentation
```
