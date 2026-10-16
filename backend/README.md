# ⚙️ Asset Management System - Backend

Enterprise-grade REST API and autonomous AI microservice suite for campus and institutional asset management.

---

## 🚀 Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Database:** MySQL 8 (`mysql2` connection pool)
- **Email Dispatch:** Nodemailer (SMTP)
- **PDF Generation:** PDFKit
- **AI Agent Suite:** Google GenAI SDK (`google-genai`), Python 3, Flask, Gemini 2.5 / 1.5 Flash

---

## 📂 Architecture

```
backend/
├── routes/              # Express API Route handlers
├── services/            # Business logic (AI Agent, Email, PDF, WhatsApp, Token Budget)
├── tools/               # Modular database tools and analytics utilities
├── python_agent/        # Autonomous Gemini 2.5 Flash Python Agent
├── db.js                # MySQL connection pool & table schema initializer
├── index.js             # Main Express server entry point
├── initialAssets.js     # Default asset catalog
├── initialData.js       # Default seed datasets (users, departments, etc.)
├── package.json         # Node.js backend dependencies & scripts
├── requirements.txt     # Python Agent dependencies
├── run_agent.py         # Python Agent runner (CLI or Flask API)
└── seedData.js          # Database seeding script
```

---

## 🛠️ Quick Start

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your MySQL credentials and API keys:
```bash
cp .env.example .env
```

Ensure your MySQL database exists:
```sql
CREATE DATABASE asset_management_db;
```

### 3. Run the Express API Server
```bash
# Development (with auto-reload)
npm run dev

# Or Production start
npm start
```
The API server will automatically initialize tables, seed initial records if empty, and listen at `http://localhost:5000`.

---

## 🤖 Python AI Agent (Gemini 2.5 Flash)

The Python AI agent provides autonomous database querying and natural language asset assistance.

### Setup Python Environment:
```bash
pip install -r requirements.txt
```

### Run Options:
1. **Interactive Terminal CLI Chatbot:**
   ```bash
   python run_agent.py
   ```
2. **REST API Microservice (Port 5050):**
   ```bash
   python run_agent.py --server --port 5050
   # or
   npm run agent:python
   ```

---

## 📦 Subject Assessment Submission

To prepare the backend zip for your subject assessment:
1. Ensure `node_modules/` and `.env` are excluded to keep file size compact.
2. Zip the entire contents of this `backend/` directory (or use `npm run zip:backend` from the repository root).
