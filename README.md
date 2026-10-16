# 🏢 Asset Management System

A simple, modern, full-stack web application to track, manage, and audit institutional and campus assets with autonomous AI capabilities.

The repository is separated into two fully independent projects:
- **`frontend/`**: Modern React 19 + Vite + Tailwind CSS dashboard (configured for direct Vercel deployment).
- **`backend/`**: Node.js Express REST API server + MySQL database layer + Gemini 2.5 Flash Python AI Agent.

---

## 📂 Repository Structure

```
c:\Projects\Asset\
├── frontend/                     # Standalone React + Vite Client
│   ├── public/                   # Static images and icons
│   ├── src/                      # React components, pages, Redux store, and API services
│   ├── .env.example              # Frontend environment template
│   ├── index.html                # Vite HTML entry point
│   ├── package.json              # Frontend dependencies & scripts
│   ├── vercel.json               # SPA routing rewrite rule for Vercel
│   ├── vite.config.js            # Vite build & proxy config
│   └── README.md                 # Frontend documentation & Vercel deployment guide
│
├── backend/                      # Standalone Node.js REST API & AI Service
│   ├── routes/                   # Express REST endpoints
│   ├── services/                 # Email, PDF, AI Agent, Rule Engine, and WhatsApp services
│   ├── tools/                    # Modular database query tools
│   ├── python_agent/             # Autonomous Gemini 2.5 Flash Python Agent
│   ├── db.js                     # MySQL connection pool & schema setup
│   ├── index.js                  # Main Express API server entry point
│   ├── initialAssets.js          # Catalog of institutional assets
│   ├── initialData.js            # Initial seed data for users, rooms, etc.
│   ├── package.json              # Backend dependencies & scripts
│   ├── requirements.txt          # Python agent dependencies
│   ├── run_agent.py              # Python agent runner (CLI or REST API)
│   ├── seedData.js               # Auto-seeder
│   └── README.md                 # Backend documentation
│
├── package.json                  # Root orchestration & packaging scripts
├── .gitignore                    # Git ignore configurations
└── README.md                     # Project documentation
```

---

## 🛠️ Quick Start

### 1. Install All Dependencies
From the root directory:
```bash
npm run install:all
```
*(Or install in each folder individually: `cd frontend && npm install` and `cd backend && npm install`)*

### 2. Configure Environment
- **Backend:** Copy `backend/.env.example` to `backend/.env` and update MySQL password / API keys.
- **Frontend:** Copy `frontend/.env.example` to `frontend/.env` (optional in local dev).

Ensure MySQL database exists:
```sql
CREATE DATABASE asset_management_db;
```

### 3. Run Everything Concurrently
From the root directory:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

Or run individual parts:
```bash
npm run dev:frontend   # Runs only frontend
npm run dev:backend    # Runs only backend
npm run dev:full       # Runs backend + frontend + python AI agent
```

---

## 🌐 Deploying Frontend to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your repository and configure:
   - **Root Directory:** Select `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the environment variable:
   - `VITE_API_URL`: Your hosted backend URL (e.g. `https://your-backend.onrender.com` or `https://your-backend.railway.app`).
5. Click **Deploy**.

> The included `frontend/vercel.json` ensures all SPA routes (like `/inventory`, `/transfers`, `/inspections`) automatically rewrite to `index.html` without 404 errors.

---

## 📦 Subject Assessment Submission (Zip Archives)

To generate clean zip files for your subject assessment submission (automatically omitting `node_modules`, `.env`, and build artifacts):

```bash
# Package both frontend and backend zips
npm run zip:all

# Or package individually:
npm run zip:frontend   # Creates frontend_submission.zip (~4MB)
npm run zip:backend    # Creates backend_submission.zip (~130KB)
```

The resulting zip files:
- `frontend_submission.zip`: Self-contained frontend project ready for grading.
- `backend_submission.zip`: Self-contained backend API & Python agent project ready for grading.

---

## 🔑 Demo Logins

| Role | Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `password123` |
| **CS Dept Admin** | `cs_admin` | `password123` |
| **Faculty Member** | `cs_faculty` | `password123` |
| **Auditor** | `auditor` | `password123` |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
