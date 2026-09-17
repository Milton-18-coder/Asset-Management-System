# 🏢 Asset Management System

A simple, modern, full-stack web application to track, manage, and audit institutional and campus assets.

---

## 🚀 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Redux Toolkit, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MySQL

---

## ✨ Features

- **Asset Management:** Register, edit, classify, and track campus assets with 3-tier categorization.
- **Location Mapping:** Organize by Buildings, Departments, and Rooms.
- **Transfers & Approvals:** Request and approve inter-departmental asset transfers.
- **Inspections & Maintenance:** Log periodic condition audits and maintenance service tickets.
- **Role-Based Access (RBAC):** Super Admin, Department Admin, Faculty, and Auditor roles with dedicated views.
- **Audit Logs & Alerts:** Real-time notifications and system action logs.

---

## 🛠️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Milton-18-coder/Asset-Management-System.git
cd Asset-Management-System
npm install
```

### 2. Environment Setup
Create a `.env` file in the root folder:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=asset_management_db
```

### 3. Database
Create the database in MySQL (tables and seed data are created automatically on launch):
```sql
CREATE DATABASE asset_management_db;
```

### 4. Run the Project
```bash
npm run dev:all
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

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
This project is open-source and available under the [MIT License](LICENSE).
