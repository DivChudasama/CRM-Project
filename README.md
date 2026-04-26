# CRM Pro — Enterprise Customer Relationship Management System

![CRM Pro](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![RBAC](https://img.shields.io/badge/Security-RBAC-red?style=for-the-badge)

A full-stack Enterprise CRM application built with the MERN stack (MongoDB, Express, React, Node.js) featuring **strict Role-Based Access Control (RBAC)**, real-time MongoDB activity logging, and a professional SaaS-grade UI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (running locally on port 27017)
- npm

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

The backend `.env` is already configured:

```env
PORT=5000
JWT_SECRET=supersecretpassword
MONGO_URI=mongodb://127.0.0.1:27017/crm_db
NODE_ENV=development
```

### 3. 🌱 Seed the MongoDB Database (IMPORTANT)

Run this command to populate the database with **3 test users** and **10 sample leads**:

```bash
cd backend
node seed.js
```

**Expected output:**
```
✅ Connected to MongoDB successfully!
✅ Created Admin: Admin (admin@example.com)
✅ Created Manager: Manager (manager@example.com)
✅ Created Agent: Agent (agent@example.com)
```

> To clear all data and reseed from scratch:
> ```bash
> node seed.js --clear
> ```

### 4. Start the Application

Open **two terminals**:

```bash
# Terminal 1 — Start backend server (port 5000)
cd backend
npm start

# Terminal 2 — Start frontend dev server (port 5173)
cd frontend
npm run dev
```

Open your browser at: **http://localhost:5173**

---

## 🔐 Test Login Credentials

| Role    | Email              | Password | Access Level            |
|---------|--------------------|----------|-------------------------|
| Admin   | admin@example.com  | 123456   | Full System Access      |
| Manager | manager@example.com| 123456   | Team Lead (No Settings) |
| Agent   | agent@example.com  | 123456   | Assigned Leads Only     |

---

## 🛡️ Role-Based Access Control (RBAC)

The CRM enforces strict RBAC at **both the frontend (UI) and backend (API) levels**.

### Access Matrix

| Feature                    | Admin | Manager | Agent |
|---------------------------|-------|---------|-------|
| Dashboard                 | ✅    | ✅      | ✅    |
| View All Leads            | ✅    | ✅      | ❌    |
| View Assigned Leads       | ✅    | ✅      | ✅    |
| Add New Lead              | ✅    | ✅      | ❌    |
| Edit Lead Details         | ✅    | ✅      | ❌    |
| Update Lead Status        | ✅    | ✅      | ✅    |
| Assign Lead to Agent      | ✅    | ✅      | ❌    |
| Delete Lead               | ✅    | ❌      | ❌    |
| Sales Reports             | ✅    | ✅      | ❌    |
| System Settings           | ✅    | ❌      | ❌    |
| User Management           | ✅    | ❌      | ❌    |
| Delete Users              | ✅    | ❌      | ❌    |
| View All Activity Logs    | ✅    | ❌      | ❌    |

### How RBAC Works

**Backend:** The `crmAccessGuard` middleware in `middleware/auth.js` enforces role checks on every API route:

```javascript
// Only Admin can delete leads
router.delete('/:id', crmAccessGuard('Admin'), removeLeadRecord);

// Only Admin can access User Management
router.get('/', crmAccessGuard('Admin'), getAllUsers);
```

**Frontend:** The `CrmRoleRoute` component in `App.jsx` prevents URL-hacking by redirecting unauthorized users:

```jsx
<Route path="/settings" element={
  <CrmRoleRoute allowedRoles={['Admin']}>
    <SettingsPage />
  </CrmRoleRoute>
} />
```

**Sidebar:** Menu items are filtered based on `user.role` — the sidebar shows a live role badge.

---

## 🍃 MongoDB — Proof of Integration

### Collections

| Collection   | Purpose                                          |
|--------------|--------------------------------------------------|
| `users`      | Stores all CRM users with hashed passwords       |
| `leads`      | Stores all lead records with `assignedTo` field  |
| `activities` | Automatic audit log for every user action        |

### Activity Logging

Every CRM action is automatically logged to MongoDB:

```javascript
// Example: Logged on every lead status change
await Activity.create({
  user: req.user.id,
  type: 'Status Changed',
  description: `${req.user.name} changed status of "Michael Brown" from New → Contacted`,
  lead: lead._id,
});
```

**Events logged automatically:**
- ✅ User Login
- ✅ Lead Created
- ✅ Lead Updated
- ✅ Lead Status Changed
- ✅ Lead Deleted

### Verify Data in MongoDB

After running `node seed.js`, verify the data in MongoDB:

```bash
# Using MongoDB shell
mongosh crm_db
db.users.find().pretty()       # See 3 users (Admin, Manager, Agent)
db.leads.find().pretty()       # See 10 sample leads
db.activities.find().pretty()  # See activity log entries
```

---

## 📁 Project Structure

```
CRM-Project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js    # crmUserLogin, crmUserRegistration
│   │   └── leadController.js    # leadLifecycleManager functions
│   ├── middleware/
│   │   └── auth.js              # verifyJwtToken, crmAccessGuard
│   ├── models/
│   │   ├── User.js              # User schema (Admin/Manager/Agent roles)
│   │   ├── Lead.js              # Lead schema (with assignedTo field)
│   │   └── Activity.js          # Activity/audit log schema
│   ├── routes/
│   │   ├── auth.js              # /api/v1/auth
│   │   ├── leads.js             # /api/v1/leads (role-protected)
│   │   ├── activities.js        # /api/v1/activities
│   │   └── users.js             # /api/v1/users (Admin only)
│   ├── seed.js                  # 🌱 Database seeder script
│   ├── server.js                # Express app entry point
│   └── .env                     # Environment configuration
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Sidebar.jsx       # Role badge + RBAC menu filtering
        │   └── LeadList.jsx      # Role-gated columns and actions
        ├── pages/
        │   ├── DashboardPage.jsx    # Welcome back [Name] ([Role])
        │   ├── LeadsPage.jsx        # Role-aware lead management
        │   ├── UserManagementPage.jsx # Admin-only user table
        │   ├── ReportsPage.jsx      # Admin + Manager only
        │   └── SettingsPage.jsx     # Admin only
        ├── context/
        │   └── AuthContext.jsx      # JWT auth state management
        └── App.jsx                  # CrmRoleRoute guards
```

---

## 🔧 API Endpoints

### Authentication
| Method | Endpoint              | Access  | Description         |
|--------|-----------------------|---------|---------------------|
| POST   | /api/v1/auth/login    | Public  | Login, returns JWT  |
| POST   | /api/v1/auth/register | Public  | Register new user   |
| PUT    | /api/v1/auth/profile  | Private | Update own profile  |

### Leads
| Method | Endpoint            | Access          | Description              |
|--------|---------------------|-----------------|--------------------------|
| GET    | /api/v1/leads       | All (filtered)  | Get leads by role        |
| POST   | /api/v1/leads       | Admin, Manager  | Create new lead          |
| PUT    | /api/v1/leads/:id   | All (restricted)| Update lead (role-aware) |
| DELETE | /api/v1/leads/:id   | Admin only      | Permanently delete lead  |

### Users
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| GET    | /api/v1/users         | Admin   | Get all users        |
| GET    | /api/v1/users/agents  | Admin+Manager | Get agent list  |
| DELETE | /api/v1/users/:id     | Admin   | Delete a user        |

### Activities
| Method | Endpoint            | Access  | Description              |
|--------|---------------------|---------|--------------------------|
| GET    | /api/v1/activities  | Private | Get activity log         |
| DELETE | /api/v1/activities  | Private | Clear activity logs      |

---

## 🎥 Video Demo Instructions

To demonstrate RBAC for evaluators:

1. **Login as Admin** (`admin@example.com` / `123456`)
   - Sidebar shows: Dashboard, Leads, Sales Reports, **User Management**, **System Settings**
   - Role badge shows: 🔴 **Role: Admin**
   - Dashboard shows: "Welcome back, Alex Carter **[Admin]**"

2. **Logout → Login as Manager** (`manager@example.com` / `123456`)
   - Sidebar shows: Dashboard, Leads, Sales Reports (**no Settings, no User Management**)
   - Role badge shows: 🟡 **Role: Manager**
   - Can assign leads to agents via dropdown

3. **Logout → Login as Agent** (`agent@example.com` / `123456`)
   - Sidebar shows: Dashboard, Leads only
   - Role badge shows: 🟢 **Role: Agent**
   - Leads table shows only **assigned** leads
   - No Add/Edit/Delete buttons — only status dropdown
   - Trying to visit `/settings` or `/users` via URL → **redirected to Dashboard**

---

## 🛠️ Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Database  | MongoDB + Mongoose |
| Backend   | Node.js + Express  |
| Auth      | JWT (jsonwebtoken) |
| Passwords | bcryptjs           |
| Frontend  | React 18 + Vite    |
| Styling   | Tailwind v4       |
| HTTP      | Axios              |
| Icons     | Lucide React       |
| Routing   | React Router v6    |
