# 🌐 Asset Management System - Frontend

Modern, high-performance web dashboard for institutional and campus asset management, built with React 19, Vite, Tailwind CSS, and Redux Toolkit.

---

## 🚀 Tech Stack

- **Framework:** React 19 (SPA)
- **Bundler:** Vite 6 / 8
- **Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit
- **Icons:** Lucide React
- **Routing:** React Router v7

---

## 🛠️ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
In local development, `VITE_API_URL` can be left blank. Vite's proxy automatically routes all `/api` requests to `http://localhost:5000`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
The compiled, optimized production bundle will be generated in `dist/`.

---

## 🚀 Deploying to Vercel

This frontend is pre-configured for zero-config deployment on [Vercel](https://vercel.com):

1. **Push your code to GitHub**.
2. Go to **Vercel Dashboard** and click **"Add New..." > "Project"**.
3. Select your repository.
4. In the setup screen:
   - **Framework Preset:** Vite
   - **Root Directory:** Click **Edit** and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: The URL of your deployed backend API (e.g., `https://your-backend.onrender.com` or `https://your-backend.railway.app`).
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID (optional).
6. Click **Deploy**!

> **Note on Client-Side Routing:** The included `vercel.json` ensures that all routes (like `/inventory`, `/transfers`, `/inspections`) redirect to `index.html`, eliminating 404 errors on page reload.

---

## 📦 Subject Assessment Submission

To prepare the frontend zip for your subject assessment:
1. Ensure `node_modules/` and `dist/` are excluded to keep file size small.
2. Zip the entire contents of this `frontend/` directory (or use `npm run zip:frontend` from the repository root).
