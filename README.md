# Stratify — Goal Setting & Tracking Portal
### AtomQuest Hackathon 1.0 Submission

## 🎯 Overview
Stratify is a unified In-House Goal Setting & Tracking 
Portal that eliminates fragmented goal-tracking with 
spreadsheets and emails. It supports the full lifecycle 
of employee goals — from creation and approval to 
quarterly check-ins and performance visibility.

## 🏗️ Architecture
- Frontend: React + Vite (SPA)
- Backend: Supabase (PostgreSQL + Auth + RLS)
- Hosting: Vercel (CDN)
- UI: Stitch Design System

## 👥 User Roles
| Role | Capabilities |
|------|-------------|
| Employee | Create goals, log achievements, view progress |
| Manager | Approve goals, conduct check-ins, push shared goals |
| Admin | Manage cycles, users, view reports & audit logs |

## 🔐 Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Employee | employee@demo.com | Employee@123 |
| Manager | manager@demo.com | Manager@123 |
| Admin | admin@demo.com | Admin@123 |

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
- Vercel account

### Local Development
1. Clone the repository
2. Install dependencies:
   npm install
3. Create .env.local file:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Run development server:
   npm run dev

### Deployment
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🛡️ Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control (RBAC)
- Environment variables for all sensitive config
- No hardcoded credentials in source code

## 📁 Project Structure
src/
  components/     — Reusable UI components
  context/        — Auth and Toast context
  hooks/          — React Query data hooks
  pages/          — Page components by role
  utils/          — Score calculation utilities
  lib/            — Supabase client

## 🏆 Built For
AtomQuest Hackathon 1.0
Problem Statement: In-House Goal Setting & Tracking Portal

## 📞 Tech Stack
React • Vite • Supabase • PostgreSQL • 
Vercel • Stitch Design System • Recharts • 
TanStack Query • React Router
