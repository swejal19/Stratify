# Stratify — Goal Setting & Tracking Portal

## 🎯 Overview
Stratify is a unified In-House Goal Setting & Tracking 
Portal that eliminates fragmented goal-tracking with 
spreadsheets and emails. It supports the full lifecycle 
of employee goals — from creation and approval to 
quarterly check-ins and performance visibility.

## 🏗️ Architecture
- **Frontend**: React + Vite (SPA)
- **Backend**: Node.js + Express (REST API)
- **Database**: PostgreSQL on Supabase (accessed via Service Role)

## 👥 User Roles
| Role | Capabilities |
|------|-------------|
| Employee | Create goals, log achievements, view progress |
| Manager | Approve goals, conduct check-ins, push shared goals |
| Admin | Manage cycles, users, view reports & audit logs |

## ✨ Features
### Phase 1 — Goal Creation & Approval
- Employee goal sheet with weighted objectives
- UoM types: Numeric Min/Max, Timeline, Zero-based
- System-enforced: 100% total weightage, min 10% per goal, max 8 goals
- Manager L1 approval with inline editing
- Goal locking after approval
- Shared Goals — push departmental KPIs to multiple employees

### Phase 2 — Achievement Tracking
- Quarterly achievement entry (Q1-Q4)
- Status per goal: Not Started / On Track / Completed
- System-computed scores:
  - numeric_min: (Actual/Target) × 100
  - numeric_max: (Target/Actual) × 100  
  - timeline: 100% if on time, 0% if late
  - zero: 100% if actual = 0
- Weighted overall score calculation

### Bonus Features
- Analytics Dashboard with recharts visualizations
- Quarter-on-Quarter performance trends
- Goal distribution by Thrust Area
- Employee Score Leaderboard

## 📊 Scoring Formulas
| UoM | Formula | Cap |
|-----|---------|-----|
| Numeric Min (Higher is Better) | (Actual ÷ Target) × 100 | 100% |
| Numeric Max (Lower is Better) | (Target ÷ Actual) × 100 | 100% |
| Timeline (Date-based) | 100% if on time, else 0% | 100% |
| Zero = Success | 100% if actual = 0, else 0% | 100% |

Overall Score = Σ (Goal Weightage% × Goal Score)

## 🗄️ Database Schema
- profiles — User accounts with roles
- cycles — Goal setting periods (FY years)
- goal_sheets — One per employee per cycle
- goals — Individual goals with UoM and targets
- achievements — Quarterly actual values
- audit_logs — All system changes tracked

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel (for frontend) & Render (for backend) accounts

### Local Development

**1. Backend Setup**
```bash
cd backend
npm install
```
Create `backend/.env`:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```
Run the backend server:
```bash
npm run dev
```

**2. Frontend Setup**
```bash
cd frontend
npm install
```
Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the frontend server:
```bash
npm run dev
```

### Deployment
1. **Backend (Render)**: Deploy the `backend` folder as a Web Service on Render. Add environment variables.
2. **Frontend (Vercel)**: Deploy the `frontend` folder to Vercel. Set `VITE_API_URL` to your Render backend URL (e.g., `https://stratify-backend-xxxx.onrender.com/api`).

## 🛡️ Security
- Custom JWT-based authentication managed by the Express backend.
- Role-aware middleware (`authorize` and `protect`) for Admin, Manager, and Employee workflows.
- Backend connects to Supabase securely via Service Role key; database is not directly accessible from the frontend.
- No hardcoded credentials in source code. Environment variables used for all sensitive configuration.

## 📁 Project Structure

```text
backend/          # Node.js + Express API
├── src/
│   ├── config/   # DB and JWT configurations
│   ├── controllers/# Business logic
│   ├── middleware/# Auth, role guard, error handling
│   ├── routes/   # Express route definitions
│   └── utils/    # Utilities (score calculator, asyncHandler)
└── server.js     # Entry point

frontend/         # React + Vite Application
├── src/
│   ├── components/ # Reusable UI components
│   ├── context/    # AuthContext for JWT management
│   ├── hooks/      # React Query data hooks
│   ├── pages/      # Page components by role
│   ├── utils/      # Score calculation utilities
│   └── lib/        # api.js for backend fetch requests
```
