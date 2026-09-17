# 🏢 Institutional Asset Management System (AMS)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-v2.5-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

A modern, full-stack **Institutional & Enterprise Asset Management System** designed for universities, colleges, and organizations to track, audit, transfer, maintain, and manage physical infrastructure and equipment across multi-building campuses.

---

## ✨ Key Features

### 🗂️ 1. Complete Asset Lifecycle Management
- **3-Tier Classification**: Hierarchical organization from Primary Categories (*Furniture, IT Equipment, Lab Instruments, Electrical*) down to specific item models.
- **Detailed Asset Profiling**: Track serial numbers, procurement cost, purchase dates, warranty validity, vendor origins, technical specifications, and condition grades.
- **Real-Time Status Tracking**: Monitor assets in states such as *In Use, Under Maintenance, Reserved, In Storage, or Disposed*.

### 🏛️ 2. Institutional Location & Campus Hierarchy
- **Campus Mapping**: Manage Buildings, Academic Sectors, Departments/Branches, Floors, and Rooms/Laboratories.
- **Asset Density & Distribution**: Instant calculations of asset counts per department, building sector, and room.
- **Dynamic Custodian Assignment**: Assign institutional faculty and staff in-charge with auto-filling contact and office details.

### 🔄 3. Transfer & Approval Workflow
- **Inter-Departmental Transfers**: Submit transfer requests from source rooms to destination rooms with justification notes.
- **Multi-Level Approval**: Department admins and Estate Officers can review, approve, or reject transfer requests in real-time.
- **Automated Location Updates**: Approvals immediately sync the asset's current room and building coordinates.

### 🛠️ 4. Inspections & Maintenance Desk
- **Periodic Physical Audits**: Log condition assessments (*Good, Fair, Poor, Damaged*) with inspector notes.
- **Service & Repair Ticketing**: Track open, in-progress, and resolved maintenance tickets with vendor assignments and repair cost metrics.
- **Decommissioning & Disposal**: Document end-of-life asset write-offs and scrap disposals.

### 🔒 5. Role-Based Access Control (RBAC) & Audit Logs
- **Granular Permissions**: Built-in access tiers for `Super Admin`, `Department Admin`, `Faculty / Staff`, and `Auditor`.
- **System Audit Trail**: Comprehensive logging of user operations, asset modifications, approvals, and credential changes.
- **Institutional Notifications**: Automated alerts for newly registered assets, service schedules, and transfer approvals.

---

## 🏗️ Architecture & Tech Stack

```
Asset-Management-System/
├── server/                   # Express.js backend REST API
│   ├── routes/               # API endpoints (assets, buildings, transfers, etc.)
│   ├── db.js                 # MySQL connection pool & table initializers
│   ├── initialData.js        # Seed baseline records
│   └── index.js              # Server entry point (Port 5000)
├── src/                      # React frontend application (Vite)
│   ├── api/                  # Axios/Fetch API client layer
│   ├── components/           # Reusable UI components & navigation
│   ├── constants/            # Asset categories & system schemas
│   ├── pages/                # Views (Dashboard, Assets, Transfers, Rooms, etc.)
│   ├── store/                # Redux Toolkit slices (global state sync)
│   └── App.jsx               # Client routing & RBAC protection
└── vite.config.js            # Vite build configuration
```

### Frontend
- **React 19** with **Vite 8** for ultra-fast HMR and bundle performance.
- **Tailwind CSS v4** + Custom Glassmorphism UI tokens for high-aesthetic dark/light mode.
- **Redux Toolkit** & **React-Redux** for robust client-side state synchronization.
- **Lucide React** for modern, crisp iconography.
- **React Router v7** for seamless declarative client routing.

### Backend & Database
- **Express 5.x** REST API server.
- **MySQL 8.x** with `mysql2` connection pooling and auto-migration schemas.
- **Concurrently** for streamlined single-command local development.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) running locally or in Docker

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Milton-18-coder/Asset-Management-System.git
   cd Asset-Management-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (or duplicate `.env.example`):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=asset_management_db
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Initialize MySQL Database:**
   Create the database in MySQL:
   ```sql
   CREATE DATABASE asset_management_db;
   ```
   *(The server will automatically generate required tables and seed initial demo data upon first boot!)*

5. **Start the Application:**
   Run both the Express backend and the Vite frontend concurrently:
   ```bash
   npm run dev:all
   ```

6. **Open in Browser:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Credentials

| Role | Username | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `password123` | Full campus-wide read/write & system configs |
| **Dept Admin (CS)** | `cs_admin` | `password123` | Computer Science department assets & approvals |
| **Dept Admin (Mech)** | `mech_admin` | `password123` | Mechanical department assets & transfers |
| **Faculty Member** | `cs_faculty` | `password123` | View assigned assets & raise transfer requests |
| **Auditor** | `auditor` | `password123` | Inspection logs & compliance review |

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/assets` | Retrieve all registered assets |
| `POST` | `/api/assets` | Register a new campus asset |
| `GET` | `/api/departments` | Fetch departments & faculty heads |
| `GET` | `/api/buildings` | List all campus buildings & floor metrics |
| `GET` | `/api/rooms` | Retrieve all mapped rooms and labs |
| `GET` | `/api/transfers` | List all inter-room transfer requests |
| `POST` | `/api/transfers/:id/approve` | Approve a pending transfer request |
| `GET` | `/api/inspections` | Fetch physical audit & condition logs |
| `GET` | `/api/maintenance` | Retrieve maintenance & service tickets |
| `GET` | `/api/audit-logs` | Retrieve chronological security & audit history |

---

## 🌿 Git Branching Convention

To maintain a clean and structured git history:
- `feat/<feature-name>`: New feature implementations (e.g. `feat/branch-suggestions`)
- `fix/<bug-description>`: Bug resolutions (e.g. `fix/room-filter-sync`)
- `ui/<component-name>`: Visual and theme enhancements (e.g. `ui/dashboard-cards`)
- `api/<route-name>`: Backend endpoints and database migrations

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
