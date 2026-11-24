# Smart Roster Management System
**AI Internship Hiring Assignment: Full Stack AI Developer**  
*Built for Datastraw Operations & Customer Experience Teams*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)
[![FullCalendar](https://img.shields.io/badge/FullCalendar-v6-orange)](https://fullcalendar.io/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()

---

## 🌟 Executive Summary & Problem Solving Approach

Customer experience and operations for growing D2C brands require balancing **strict client coverage SLAs** (e.g., 365-day live chat support vs. Monday–Saturday schedules) against **human employee constraints** (contractual weekly offs, planned leaves, comp-offs, and skill sets).

This project is a **production-ready Smart Roster Management System** designed to solve this scheduling challenge across **pods, brands, and processes**. Instead of simply digitizing a calendar, it implements an **explainable deterministic constraint-satisfaction engine** with real-time conflict auditing, multi-perspective operational views, manual override capabilities, and automated dynamic change handling.

---

## 🚀 Key Features Built

### 1. Realistic Operational Data Modeling ($\ge 30$ Employees)
- **32 Team Members** distributed across **3 Operational Pods** (Beauty & Wellness, Fashion & Lifestyle, Consumer Electronics), each overseen by a designated **Pod Lead**.
- **10 Brands with Realistic Distribution:**
  - **~80% Dedicated Brands (8 Brands):** Managed by a single dedicated agent handling all processes for that brand (e.g., *Glow Aura Skincare*, *Urban Stitch*).
  - **~20% Multi-Resource Brands (2 Brands):** Staffed by multiple agents (e.g., *NexaStyle Fast Fashion* with separate CS, ACC, and NDR agents; *Apex Electronics Global* with staggered 365-day coverage).
- **Multiple Operational Processes:** Customer Support (CS), Abandoned Cart Conversions (ACC), Non-Delivery Report Management (NDR), and Retention (RET).

### 2. Client-Specific Operating Calendars & Minimum Staffing
- Decouples brand operating rules from individual employee contracts:
  - **365-Day Operations:** Continuous coverage including Sundays and public holidays (e.g., *Glow Aura*, *Apex Electronics*).
  - **Daily excluding Holidays:** Operational every day except gazetted holidays (e.g., *NexaStyle CS*).
  - **Standard Monday–Saturday / Monday–Friday:** Excluding Sundays and public holidays.
  - **Minimum Staffing Rules:** Configurable headcount thresholds on active days.

### 3. The 5 Mandatory Roster Views
1. **🏢 Company-Wide Monthly Matrix:** High-density interactive matrix displaying all 32 employees, shift statuses, and assignments for any month.
2. **👥 Pod-Wise Schedules:** Grouped by operational pods, highlighting the Pod Lead and their team members.
3. **🏷️ Brand-Wise Coverage Health:** Daily color-coded indicators (Green: Fully Covered, Amber: Understaffed, Red: Zero-Coverage Gap, Gray: Closed/Off) showing SLA fulfillment.
4. **⚙️ Process-Wise Staffing:** Aggregated daily active staffing count across CS, ACC, NDR, and Retention.
5. **👤 Employee-Wise View (FullCalendar):** Month calendar for any selected employee showing personal working shifts, weekly offs, comp-offs, holidays, and leaves.

### 4. Real-Time Conflict Detection & Validation
- Distinguishes between **Hard Errors** (blocking publishing) and **Coverage Warnings**:
  - `ZERO_COVERAGE` (Hard Error): Brand process requires coverage, but 0 employees are assigned.
  - `DOUBLE_BOOKING` (Hard Error): Employee assigned to multiple conflicting full-time shifts on the same day.
  - `LEAVE_CLASH` (Hard Error): Employee scheduled to work on an approved planned leave date.
  - `UNDERSTAFFED` (Warning): Active staff is less than minimum required staffing.
  - `PREFERENCE_UNMET` (Warning): Employee preferred a specific day off, but was scheduled to maintain coverage.
  - `FATIGUE_OVERLOAD` (Warning): Employee scheduled for $> 6$ consecutive days without rest.
- **Interactive Conflict Drawer:** Explains conflicts in plain English with affected brand, process, and date.
- **Shift Override Modal:** Click any cell in the matrix to manually edit shift status or reassign brand processes; triggers instant re-validation.

### 5. Dynamic Change Simulator (Assessment Section 3.F)
- Interactive testing sandbox to simulate what happens when an employee takes sudden leave after roster generation:
  - **Single-Resource Scenario:** Dedicated agent for 365-day brand calls in sick $\rightarrow$ immediate zero coverage gap flagged.
  - **Multi-Resource Scenario:** Evaluates if remaining agents can maintain required coverage or if a deficit occurs.
  - **Automated Replacement Recommendations:** Scans the same pod for idle/off teammates with matching skills and provides a 1-click **"Assign Replacement & Rebalance"** action.

---

## 🧠 Section 8: "Tell Us How You Think" (Direct Assessment Answers)

### 1. How did you model employees, brands, processes, pods, and their relationships?
I modeled the domain by strictly decoupling **client operating requirements** from **individual employee contracts**, connecting them through an explicit operational bridge:
- **Pods & Pod Leads:** Pods represent operational business units (Beauty & Wellness, Fashion, Electronics). Each pod has a designated Pod Lead who oversees day-to-day delivery and team schedules.
- **Employees:** Every employee belongs to a home pod and carries personal contractual attributes: verified skill tags (CS, ACC, NDR, RET) and their contractual rest day (e.g., Sunday).
- **Brands & Processes:** A brand represents a client, while processes represent specific functional services. Instead of attaching schedules directly to brands, I created a `brand_processes` bridge entity. This defines the client's actual operating calendar (e.g., 365-day continuous chat vs. Monday–Saturday excluding public holidays) and the minimum staffing count required for that process.
- **Assignments:** Finally, `employee_assignments` maps employees to brand processes as either primary owners or secondary backups. Because brand requirements and employee contracts live in separate entities, an employee's leave or rest day never corrupts the underlying client SLA calendar.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?
I chose a deterministic, multi-pass constraint scheduling engine rather than an opaque black box so that every single shift decision is explainable and verifiable:
1. **Operational Demand Ingestion:** The engine first computes the exact dates the brand process must operate in the month, factoring in the operating model and gazetted public holidays.
2. **Hard Baseline Pre-locking:** Approved planned leaves and comp-offs are locked into the employee's calendar first as non-negotiable hard constraints.
3. **Core Assignment Pass:** For single-resource brands (~80%), the engine schedules the dedicated agent on active operating days while respecting contractual rest days. For multi-resource brands (~20%), weekly offs are systematically staggered across assigned staff so the active headcount never dips below `minStaffCount`.
4. **Preference-Aware Optimization:** Where multiple rest day options fulfill client coverage equally well, the engine respects the employee’s preferred off day as a soft constraint.
5. **Two-Tier Validation Audit:** A secondary validator audits the compiled schedule against double-bookings, leave clashes, understaffing, and consecutive fatigue, populating a structured conflict register that updates instantly on any manual edit.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?
These two brand types represent fundamentally different operational dynamics:
- **Single-Resource Brands (~80%):** A single dedicated employee handles all customer operations for that brand. The brand's operational health is directly dependent on that one person. When this employee takes a weekly off or approved leave, the system does not create artificial or "ghost" coverage—it transparently marks a `ZERO_COVERAGE` hard conflict so management knows an explicit peer backup must be assigned.
- **Multi-Resource Brands (~20%):** Multiple employees share or divide processes (for example, NexaStyle has separate agents for CS, ACC, and NDR, while Apex has two agents sharing a 365-day CS desk). Here, the engine applies staggered rest rotations: Agent A takes Tuesday/Wednesday off while Agent B takes Saturday/Sunday off. This guarantees continuous coverage on every single required operating day without violating rest day rules.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?
When a dedicated employee is unavailable on a client operating day (due to approved leave, weekly off on a 365-day brand, or unexpected illness), the system initiates an immediate three-part mitigation workflow:
1. **Immediate Gap Visibility:** The brand's cell turns red across the Brand-Wise and Company-Wide views, and a blocking `ZERO_COVERAGE` hard error is logged.
2. **Publish Safeguard:** The operations manager is blocked from publishing the roster to employees until this coverage gap is actively resolved.
3. **Smart Substitute Matching (Section 3.F):** In the Change Simulator, the system scans that employee’s pod to identify colleagues who are already scheduled for a rest day on that date and possess verified matching skills (e.g., CS). The manager is presented with a ranked candidate list and can rebalance the roster with a single click, immediately transferring the shift and clearing the conflict.

### 5. How does your system handle conflicting requirements or insufficient staffing?
I structured scheduling rules into a strict **Two-Tier Hierarchy** so operations managers always know what is non-negotiable versus what is an advisory tradeoff:
- **Hard Conflicts (Blocking):** Genuinely destructive situations—such as a brand having zero staff on an operating day, an employee assigned to overlapping full-time shifts (double booking), or scheduling someone on approved medical/planned leave. These produce red alerts and strictly block roster publication.
- **Soft Warnings (Advisories):** Operational compromises—such as minor understaffing (1 agent working when 2 are preferred) or scheduling an employee on their preferred off-day to maintain essential client coverage. These produce amber notifications that explain the reason and allow managers to proceed at their discretion.
If requirements cannot be fully satisfied, the system never fails silently or fakes data; it outputs the best viable schedule, clearly flags the shortfall, and explains the root cause.

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?
- **What I Automated:**
  - Day-by-day calendar calculations (handling public holiday exemptions and 365-day vs. 6-day rules).
  - Staggering rest day rotations across multi-resource teams.
  - Multi-perspective matrix compilation (Company, Pod, Brand, Process, Employee).
  - Instant conflict detection and qualified backup candidate ranking.
- **What I Left Under Human Control:**
  - Approving substitute reassignments and manual shift edits.
  - Final publication and release of the monthly roster.
- **Why?** Algorithms are exceptionally good at calculating combinatorial calendar rules and spotting gaps in milliseconds. However, operational staffing involves human context that code cannot know—such as brand-client chemistry, individual agent learning curves, or personal emergencies. The tool is designed as an intelligent co-pilot that surfaces the facts and recommended fixes, leaving the final accountability with the operations lead.

### 7. If the company doubled its team and brand count, what would you change about your solution?
If Datastraw scaled to 60+ employees and 20+ brands, I would adapt the architecture in four key ways:
1. **Pod-Level Sharding:** Since pods operate relatively independently, roster generation can be sharded and processed concurrently per pod (via Web Workers or background serverless jobs), keeping UI response instantaneous.
2. **Database-Level Batch Computation:** Instead of transforming rosters entirely in browser memory, store generated shifts directly in PostgreSQL with indexed views, reducing client payload.
3. **Constraint Solver (ILP):** For multi-resource brands with complex shift patterns, integrate a lightweight integer programming solver (such as Google OR-Tools) to optimize fairness scores across larger candidate pools.
4. **Role-Based Access Control (RBAC):** Implement Supabase Row Level Security so Pod Leads can only view and edit their own pod's assignments, while Operations Managers maintain global company-wide access.

### 8. If you had one additional week to work on this, what would you improve first?
With one additional week, I would focus on three high-impact enhancements:
1. **Peer-to-Peer Shift Swap Marketplace:** Allow agents to request mutual shift swaps directly from their employee calendar, automatically checking skill compatibility and routing the request to the Pod Lead for 1-click approval.
2. **Rolling Fairness & Weekend Balance Tracker:** Add an analytics tab tracking who worked on past weekends and public holidays over a 3- to 6-month period, ensuring overtime and unsocial hours are distributed equitably across the entire team.
3. **Automated External Sync:** Implement 1-click export to Google Sheets and automated webhooks to post published schedules directly to Slack pod channels.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons + Modern responsive cards and tables
- **Interactive Calendar:** FullCalendar v6 (`@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`)
- **Backend & Database:** Supabase (Managed PostgreSQL) with full DDL migration script and seed script
- **Scheduling Engine:** Pure TypeScript deterministic constraint engine (`src/lib/engine/`)
- **Deployment:** Vercel (Edge-compatible, zero external infrastructure required)

---

## 📂 Project Structure

```
c:\DataStrawAssignment/
├── .env.example                     # Sample Supabase environment variables
├── README.md                        # Documentation with answers to the 8 required assessment questions
├── package.json
├── tsconfig.json
├── supabase/
│   ├── migrations/
│   │   └── 20261123_init_schema.sql # Complete PostgreSQL schema with indexes and constraints
│   └── seed.sql                     # Seed script: 32 employees, 3 pods, 10 brands, calendars, leaves
├── scripts/
│   └── verify-engine.mjs            # Automated verification test suite
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with sidebar navigation
│   │   ├── page.tsx                 # Operations overview dashboard
│   │   ├── roster/
│   │   │   └── page.tsx             # Interactive Roster Hub with 5 view toggles & toolbar
│   │   ├── change-simulator/
│   │   │   └── page.tsx             # Dynamic change & replacement simulator (Section 3.F)
│   │   ├── brands/
│   │   │   └── page.tsx             # Brands, processes & client operating calendar rules
│   │   ├── teams/
│   │   │   └── page.tsx             # 32 Employees directory with Pods and Pod Leads
│   │   └── leaves/
│   │       └── page.tsx             # Approved leaves, comp-offs, and public holidays
│   ├── components/
│   │   ├── calendar/
│   │   │   └── EmployeeCalendar.tsx # FullCalendar integration for individual monthly schedules
│   │   ├── roster/
│   │   │   ├── CompanyView.tsx      # High-density monthly grid: All 32 employees vs dates
│   │   │   ├── PodView.tsx          # Grouped by Pods with Pod Leads highlighted
│   │   │   ├── BrandView.tsx        # Brand & process daily coverage health grid (Green/Amber/Red)
│   │   │   ├── ProcessView.tsx      # Process-wise daily staffing distribution
│   │   │   ├── ConflictPanel.tsx    # Slide-over auditor for Hard Errors & Warnings
│   │   │   └── ShiftEditModal.tsx   # Modal to manually override shifts with live re-validation
│   │   └── ui/
│   ├── lib/
│   │   ├── types.ts                 # TypeScript data contracts and interfaces
│   │   ├── data/
│   │   │   ├── seedData.ts          # Complete seed dataset (32 staff, 10 brands, 3 pods)
│   │   │   └── store.ts             # Data repository supporting in-memory & Supabase sync
│   │   ├── engine/
│   │   │   ├── generator.ts         # Deterministic constraint scheduling algorithm
│   │   │   ├── validator.ts         # Real-time conflict audit & rule validator
│   │   │   └── changeHandler.ts     # Dynamic absence simulator & backup matcher
│   │   └── supabase/
│   │       ├── client.ts            # Supabase browser client
│   │       └── server.ts            # Supabase server client
│   └── tests/
│       └── roster-e2e.spec.ts       # Full Playwright end-to-end browser test suite
```

---

## 💻 Local Setup & Development Instructions

### Prerequisites
- **Node.js**: v18+ or v20+ (tested on Node v22)
- **npm** or **pnpm**

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/OvezKhan/Smart-Roster-Management-System.git
cd Smart-Roster-Management-System
npm install --legacy-peer-deps
```

### Step 2: Environment Variables
Create a `.env.local` file (optional if testing with bundled in-memory seed dataset):
```bash
cp .env.example .env.local
```
*(The system automatically boots out-of-the-box with the complete realistic 32-employee seed dataset even without Supabase credentials!)*

### Step 3: Run Engine Self-Check Verification Test
Verify the scheduling logic, constraints, and change simulator:
```bash
npx tsx scripts/verify-engine.mjs
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Run Playwright E2E Tests
```bash
npx playwright test
```

### Step 6: Production Build
```bash
npm run build
npm run start
```

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"New Project"**.
3. Import the GitHub repository `OvezKhan/Smart-Roster-Management-System`.
4. Set Build Command: `npm run build`
5. (Optional) Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**. The app is deployed with zero cold starts.

---

## 🎬 Demo Walkthrough Guide (For 3–5 Minute Video)

1. **Introduction & Team Scale (0:00 - 0:45):**
   - Open the **Operations Dashboard (`/`)**.
   - Show the 32 employees, 3 operational pods with Pod Leads, and 10 brands.
   - Point out the 80% single-resource vs 20% multi-resource distribution.
2. **Interactive Roster Hub & 5 Views (0:45 - 2:00):**
   - Navigate to `/roster`.
   - Click **1. Company-Wide View** to show the entire monthly matrix with active shifts, Sunday offs, holidays, Neha's 5 leaves, and Rahul's 4 leaves.
   - Switch to **2. Pod-Wise View** to show schedules under Pod Leads.
   - Switch to **3. Brand-Wise View** to show the daily Green/Amber/Red coverage indicators.
   - Switch to **4. Process-Wise View** to demonstrate process distribution.
   - Switch to **5. Employee-Wise View** to showcase the **FullCalendar** monthly schedule for individual employees.
3. **Conflict Detection & Shift Override (2:00 - 3:00):**
   - Open the **Conflict Drawer**.
   - Show how the system flags the 80% single-resource brand (Glow Aura) when the sole agent takes their weekly off or leave.
   - Click on any shift cell in the matrix, open the **Shift Edit Modal**, change an assignment, and show live re-validation!
4. **Dynamic Change Handling Simulation (3:00 - 4:00):**
   - Navigate to `/change-simulator`.
   - Click **"Scenario 1: Neha Verma reports sick"**.
   - Show how the system flags the resulting gap for Glow Aura Skincare.
   - Show the **System-Recommended Qualified Substitutes** from the same pod with matching skills.
   - Click **"Assign as Replacement & Rebalance"** and show that coverage is immediately restored!

---

## 📧 Submission Information

- **Primary Submission Recipients:** `ozair.shaikh@datastraw.in` | `aryan.jaiswal@datastraw.in`
- **CC:** `talent@datastraw.in`
- **Subject:** `Smart Roster Management System Assignment - [Your Full Name]`
- **Backend & Database:** Supabase (Managed PostgreSQL) with full DDL migration script and seed script
- **Scheduling Engine:** Pure TypeScript deterministic constraint engine (`src/lib/engine/`)
- **Deployment:** Vercel (Edge-compatible, zero external infrastructure required)

---

## 📂 Project Structure

```
c:\DataStrawAssignment/
├── .env.example                     # Sample Supabase environment variables
├── README.md                        # Documentation with answers to the 8 required assessment questions
├── package.json
├── tsconfig.json
├── supabase/
│   ├── migrations/
│   │   └── 20261123_init_schema.sql # Complete PostgreSQL schema with indexes and constraints
│   └── seed.sql                     # Seed script: 32 employees, 3 pods, 10 brands, calendars, leaves
├── scripts/
│   └── verify-engine.mjs            # Automated verification test suite
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with sidebar navigation
│   │   ├── page.tsx                 # Operations overview dashboard
│   │   ├── roster/
│   │   │   └── page.tsx             # Interactive Roster Hub with 5 view toggles & toolbar
│   │   ├── change-simulator/
│   │   │   └── page.tsx             # Dynamic change & replacement simulator (Section 3.F)
│   │   ├── brands/
│   │   │   └── page.tsx             # Brands, processes & client operating calendar rules
│   │   ├── teams/
│   │   │   └── page.tsx             # 32 Employees directory with Pods and Pod Leads
│   │   └── leaves/
│   │       └── page.tsx             # Approved leaves, comp-offs, and public holidays
│   ├── components/
│   │   ├── calendar/
│   │   │   └── EmployeeCalendar.tsx # FullCalendar integration for individual monthly schedules
│   │   ├── roster/
│   │   │   ├── CompanyView.tsx      # High-density monthly grid: All 32 employees vs dates
│   │   │   ├── PodView.tsx          # Grouped by Pods with Pod Leads highlighted
│   │   │   ├── BrandView.tsx        # Brand & process daily coverage health grid (Green/Amber/Red)
│   │   │   ├── ProcessView.tsx      # Process-wise daily staffing distribution
│   │   │   ├── ConflictPanel.tsx    # Slide-over auditor for Hard Errors & Warnings
│   │   │   └── ShiftEditModal.tsx   # Modal to manually override shifts with live re-validation
│   ├── lib/
│   │   ├── types.ts                 # TypeScript data contracts and interfaces
│   │   ├── data/
│   │   │   ├── seedData.ts          # Complete seed dataset (32 staff, 10 brands, 3 pods)
│   │   │   └── store.ts             # Data repository supporting in-memory & Supabase sync
│   │   ├── engine/
│   │   │   ├── generator.ts         # Deterministic constraint scheduling algorithm
│   │   │   ├── validator.ts         # Real-time conflict audit & rule validator
│   │   │   └── changeHandler.ts     # Dynamic absence simulator & backup matcher
│   │   └── supabase/
│   │       ├── client.ts            # Supabase browser client
│   │       └── server.ts            # Supabase server client
```

---

## 💻 Local Setup & Development Instructions

### Prerequisites
- **Node.js**: v18+ or v20+ (tested on Node v22)
- **npm** or **pnpm**

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <your-repo-url>
cd DataStrawAssignment
npm install --legacy-peer-deps
```

### Step 2: Environment Variables
Create a `.env.local` file (optional if testing with bundled in-memory seed dataset):
```bash
cp .env.example .env.local
```
*(The system automatically boots out-of-the-box with the complete realistic 32-employee seed dataset even without Supabase credentials!)*

### Step 3: Run Engine Self-Check Verification Test
Verify the scheduling logic, constraints, and change simulator:
```bash
npx tsx scripts/verify-engine.mjs
```
Expected output:
```
--- Running Engine Self-Check Verification ---
[1] Verifying employee headcount: 32
[2] Brands: 10 total (8 single-resource [80%], 2 multi-resource)
[3] Generated Shifts: 992, Hard Errors: 36, Warnings: 0
[4] Single-Resource 365-day Brand Gap Detection: 7 gaps identified for Glow Aura
[5] Testing Dynamic Change Simulation (Section 3.F)...
    Affected brand: Glow Aura Skincare, Gap Created: true
    Recommended Substitutes Found: 5
✅ ALL ENGINE CHECKS PASSED SUCCESSFULLY!
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Production Build
```bash
npm run build
npm run start
```

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"New Project"**.
3. Import the GitHub repository.
4. Set Build Command: `npm run build`
5. (Optional) Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**. The app is deployed with zero cold starts.

---

## 🎬 Demo Walkthrough Guide (For 3–5 Minute Video)

1. **Introduction & Team Scale (0:00 - 0:45):**
   - Open the **Operations Dashboard (`/`)**.
   - Show the 32 employees, 3 operational pods with Pod Leads, and 10 brands.
   - Point out the 80% single-resource vs 20% multi-resource distribution.
2. **Interactive Roster Hub & 5 Views (0:45 - 2:00):**
   - Navigate to `/roster`.
   - Click **1. Company-Wide View** to show the entire monthly matrix.
   - Switch to **2. Pod-Wise View** to show schedules under Pod Leads.
   - Switch to **3. Brand-Wise View** to show the daily Green/Amber/Red coverage indicators.
   - Switch to **4. Process-Wise View** to demonstrate process distribution.
   - Switch to **5. Employee-Wise View** to showcase the **FullCalendar** monthly schedule for individual employees.
3. **Conflict Detection & Shift Override (2:00 - 3:00):**
   - Open the **Conflict Drawer**.
   - Show how the system flags the 80% single-resource brand (Glow Aura) when the sole agent takes their weekly off or leave.
   - Click on any shift cell in the matrix, open the **Shift Edit Modal**, change an assignment, and show live re-validation!
4. **Dynamic Change Handling Simulation (3:00 - 4:00):**
   - Navigate to `/change-simulator`.
   - Click **"Scenario 1: Neha Verma reports sick"**.
   - Show how the system flags the resulting gap for Glow Aura Skincare.
   - Show the **System-Recommended Qualified Substitutes** from the same pod with matching skills.
   - Click **"Assign as Replacement & Rebalance"** and show that coverage is immediately restored!

---

## 📧 Submission Information

- **Primary Submission Recipients:** `ozair.shaikh@datastraw.in` | `aryan.jaiswal@datastraw.in`
- **CC:** `talent@datastraw.in`
- **Subject:** `Smart Roster Management System Assignment - [Your Full Name]`
