# 🎯 Stratify — Goal Setting & Tracking Portal

---

## 📖 Overview

Stratify is a production-ready, full-stack enterprise 
Goal Setting and Tracking Portal built for AtomQuest 
Hackathon 1.0. It eliminates fragmented goal-tracking 
via spreadsheets and emails by providing a unified 
digital platform for the complete lifecycle of 
employee goals — from creation and approval to 
quarterly check-ins and performance analytics.

The system supports three distinct user roles 
(Employee, Manager, Admin) with completely 
differentiated access, workflows, and dashboards.

---

## 🏗️ Architecture

Browser (React SPA)
↓ HTTPS
Vercel CDN (Frontend)
↓ REST API calls
Render.com (Express Backend)
↓ Service Role Key
Supabase (PostgreSQL Database + Auth)


### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| UI System | Stitch Design System |
| State Management | TanStack Query (React Query) |
| Routing | React Router v6 |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | PostgreSQL via Supabase |
| Authentication | Supabase Auth + Custom JWT |
| Frontend Hosting | Vercel CDN |
| Backend Hosting | Render.com |

---

## 👥 User Roles & Capabilities

### 👤 Employee
- Create and manage personal goal sheet
- Add up to 8 goals with weighted objectives
- Submit goals for manager approval
- Log quarterly achievements (Q1-Q4)
- View computed progress scores
- Track overall weighted performance
- View My Progress dashboard

### 👨💼 Manager (L1)
- Personal dashboard with team overview
- Review and approve/return team goal sheets
- Edit targets and weightages inline before approval
- Conduct quarterly check-ins with comments
- View team reports with Q1-Q4 actuals
- Push shared goals to multiple employees
- Export team data as CSV

### 🛡️ Admin
- Manage goal setting cycles (FY periods)
- Create, edit, delete user accounts
- Approve or reject access requests
- Unlock locked goal sheets
- View company-wide analytics dashboard
- Access achievement reports with CSV export
- View paginated audit logs
- Manage user roles and manager assignments

---

## ✨ Features — Fully Implemented

### Phase 1 — Goal Creation & Approval

#### Employee Goal Sheet
- Auto-created on first access for active cycle
- Status lifecycle: draft → submitted → approved → locked
- Rework flow: manager returns → employee edits → resubmits

#### Strict Validation Rules (BRD Compliant)
- ✅ Total weightage must equal exactly 100%
- ✅ Minimum 10% weightage per individual goal
- ✅ Maximum 8 goals per employee per cycle
- ✅ Live weightage progress bar (red/green indicator)
- ✅ Submit button disabled until validation passes

#### 4 Unit of Measurement (UoM) Types
| UoM | Description | Score Formula |
|-----|-------------|---------------|
| numeric_min | Higher is better (e.g. revenue) | (Actual ÷ Target) × 100 |
| numeric_max | Lower is better (e.g. TAT) | (Target ÷ Actual) × 100 |
| timeline | Date-based delivery | 100% if on time, 0% if late |
| zero | Zero = success (e.g. incidents) | 100% if actual = 0 |

> Scores capped at 150% per BRD specification

#### Manager Approval Workflow
- Review submitted goal sheets
- Inline edit targets and weightages before approving
- Approve → goals locked permanently
- Return for Rework → mandatory comment required
- Employee sees rework comment in yellow alert banner

#### Goal Locking
- Once approved, all goal fields become read-only
- Admin can unlock via User Management panel
- Unlock action permanently recorded in audit log

#### Shared Goals
- Manager/Admin pushes a common goal to multiple employees
- Recipients get goal with is_shared flag
- Title and target are read-only for recipients
- Weightage is adjustable by recipient
- Shown with "Shared" badge on employee goals page

### Phase 2 — Achievement Tracking

#### Quarterly Achievement Entry (Employee)
- Log actual values per goal per quarter (Q1-Q4)
- Quarter auto-detected from cycle open dates
  (not calendar months)
- Input type changes based on UoM:
  - numeric: number input
  - timeline: date picker
  - zero: checkbox
- Status per goal: Not Started / On Track / Completed
- Optional employee note per goal
- Save Check-in button per goal (upsert semantics)

#### Real-time Score Computation
- Score computed instantly on input change
- Progress bar animates to score value
- Color coded: green ≥100%, yellow 50-99%, red <50%
- Overall weighted score = Σ(weightage% × score)

#### Manager Check-in Module
- View all team members with Q[current] scores
- Side panel showing Planned vs Actual per goal
- Add structured check-in feedback comment
- Mark Check-in Complete button
- Team completion rate shown as percentage

#### My Progress (Employee)
- Overall weighted score as animated circular dial
- Per-goal breakdown with target vs actual
- Quarter summary (Q1-Q4 indicators)
- Employee notes shown per goal

### Reporting & Governance

#### Achievement Reports
- Full Q1-Q4 actuals per employee per goal
- Computed scores per quarter
- Weighted contribution per goal
- CSV export with all data
- Available for Manager (team) and Admin (all)

#### Analytics Dashboard (Admin + Manager)
- Average team weighted score KPI card
- Goals on track count
- Goals completed count
- Q[current] check-in completion rate
- Quarter-on-Quarter bar chart (employee trends)
- Quarterly Score Radar chart
- Goals by Thrust Area donut chart
- UoM Type distribution donut chart
- Achievement Status stacked bar chart
- Employee Score Leaderboard with medals 🥇🥈🥉

#### Audit Log (Admin)
- Every critical action permanently logged
- Captures: who, what, when, old data, new data
- Paginated (20 entries per page)
- JSON diff view for old vs new data
- Actions tracked: goal approval, rework, unlock, 
  user creation, deletion, access request decisions

### Access Request & Onboarding

#### Self-Service Access Requests
- Public /request-access page (no login required)
- Fields: name, email, role (employee/manager only),
  department, manager email
- Admin role requests blocked at API level
- Duplicate prevention (existing user + pending request)
- Success message after submission

#### Admin Access Request Management
- Dedicated Access Requests page in admin panel
- Filter by: All / Pending / Approved / Rejected
- Red badge on sidebar showing pending count
- One-click Approve → auto-creates account with 
  temporary password shown in modal
- Reject with optional rejection reason
- All decisions logged to audit trail

### User Management (Admin)

#### Add New User
- Create employee, manager, or admin accounts
- Assigns role, department, and reporting manager
- Uses Supabase Auth for secure account creation

#### Edit User
- Change role, department, manager assignment
- Side drawer UI with instant save

#### Delete User (Cascade)
- Removes: achievements → goals → goal_sheets → profile
- Removes manager assignment from direct reports  
- Deletes Supabase Auth account
- Audit log entry created
- Cannot delete own account or other admins

#### Unlock Goals
- Admin can reset any locked goal sheet to draft
- Recorded in audit log

### Security

#### API Security (Express Backend)
- JWT authentication on all protected routes
- Role-based authorization middleware
- Three-tier rate limiting:
  - Global: 1000 req/15min per IP
  - Auth endpoints: 10 req/15min per IP
  - Admin endpoints: 200 req/15min per IP
- Helmet.js security headers
- CORS restricted to frontend URL only
- No sensitive data in error messages
- Service Role Key server-side only (never exposed)

#### Authentication Flow
- Supabase Auth handles email/password
- Express generates custom JWT on login
- JWT verified on every protected request
- Role fetched from database (never trusted from token)

#### Data Security
- All database operations server-side via Express
- Supabase Service Role Key never sent to browser
- Environment variables for all sensitive config
- No hardcoded credentials in source code

### Additional Features

#### Cycle Management (Admin)
- Create goal setting cycles with all Q1-Q4 dates
- Only one cycle active at a time
- Toggle active/inactive status
- Cycle dates drive quarter detection logic

#### Dynamic Quarter Detection

if today >= q4_open → Q4
elif today >= q3_open → Q3
elif today >= q2_open → Q2
elif today >= q1_open → Q1
else → Goal Setting period


#### Landing Page
- Animated hero section
- Feature showcase cards
- Role comparison section
- How it works steps
- Responsive design

#### Login Page
- Quick Demo Access cards (Employee/Manager/Admin)
- Click to auto-fill credentials
- "Request Access" link for new users
- Back to Home button

#### Health Check
- GET /health → server status + timestamp
- HEAD /health → for uptime monitors

---

## 🗄️ Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| profiles | User accounts extending Supabase Auth |
| cycles | Goal setting fiscal year periods |
| goal_sheets | One per employee per cycle |
| goals | Individual goals with UoM and targets |
| achievements | Quarterly actual values per goal |
| audit_logs | Immutable change history |
| access_requests | Pending/approved/rejected signup requests |

### Enums
- user_role: employee, manager, admin
- goal_status: draft, submitted, approved, rework, locked
- uom_type: numeric_min, numeric_max, timeline, zero
- checkin_status: not_started, on_track, completed

### Key Relationships

profiles ─── goal_sheets ─── goals ─── achievements
│ │
cycles audit_logs


---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 22+
- Supabase account
- Vercel account
- Render account

### Database Setup
1. Create Supabase project at supabase.com
2. Run the SQL schema in Supabase SQL Editor
3. Copy Project URL and Service Role Key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your values
npm run dev
# Runs on http://localhost:5000
```

### Backend Environment Variables

PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development


### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your values
npm run dev
# Runs on http://localhost:5173
```

### Frontend Environment Variables

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000/api


### Deployment

#### Backend → Render
1. Push backend to GitHub
2. New Web Service on Render
3. Root Directory: backend
4. Build: npm install
5. Start: npm start
6. Add environment variables
7. Deploy!

#### Frontend → Vercel
1. Push frontend to GitHub
2. Import on Vercel
3. Add environment variables
4. Deploy!

---

## 📊 Scoring Formula Reference

### Goal Score Calculation
| UoM | Formula | Cap |
|-----|---------|-----|
| numeric_min | (Actual ÷ Target) × 100 | 150% |
| numeric_max | (Target ÷ Actual) × 100 | 150% |
| timeline | 100 if on time, else 0 | 100% |
| zero | 100 if actual = 0, else 0 | 100% |

### Overall Weighted Score

Overall = Σ (goal.weightage / 100 × goalScore)

Example:
Sales Target 40% × 85% = 34
Customer TAT 30% × 150% = 45
Product Roadmap 20% × 100% = 20
Safety 10% × 100% = 10
Total = 109%


---

## 📁 Project Structure
```text
ATOMQUEST/
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── layout/ AppLayout, ProtectedRoute
│ │ │ └── shared/ PushGoalModal, etc
│ │ ├── context/ AuthContext, ToastContext
│ │ ├── hooks/ useGoals, useAchievements, etc
│ │ ├── lib/ supabase.js, api.js
│ │ ├── pages/
│ │ │ ├── admin/ Dashboard, Cycles, Users,
│ │ │ │ Reports, Analytics, Audit,
│ │ │ │ AccessRequests
│ │ │ └── employee/ Goals, Achievements, Progress
│ │ └── utils/ achievementUtils, scoreCalc
│ └── vercel.json
│
└── backend/
├── src/
│ ├── config/ db.js, jwt.js
│ ├── controllers/ auth, goals, sheets,
│ │ achievements, cycles,
│ │ users, reports, audit,
│ │ accessRequest
│ ├── middleware/ auth.js, role.js, errorHandler
│ ├── routes/ all route files
│ └── utils/ scoreCalculator, asyncHandler
└── server.js
```
---

## 🔒 Security Notes

| Security Measure | Implementation |
|-----------------|----------------|
| Authentication | Supabase Auth + Custom JWT |
| Authorization | Role middleware on every protected route |
| Rate Limiting | 3-tier express-rate-limit |
| Security Headers | Helmet.js |
| CORS | Restricted to frontend URL |
| Secrets | Environment variables only |
| Admin Operations | Service Role Key server-side only |
| API Security | JWT verified on every request |

---

*Built with ❤️ for AtomQuest Hackathon 1.0*
