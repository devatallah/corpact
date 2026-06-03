# Teamat (تيمات) — Document

**Corporate Sports & Employee Wellness Platform**
*Connecting Companies, Sports Venues, and Employees*

---

## 1. Executive Summary

**Teamat** is a B2B2C SaaS platform that transforms corporate employee wellness by connecting companies with sports venues (businesss) and empowering employees to organize, participate in, and compete through sports activities — all managed through an intelligent, automated platform.

The platform serves **four stakeholder groups** through dedicated portals:
- **Companies (HR)** — Manage employee wellness budgets, communities, and analytics
- **Sports businesss** — Manage venues, pricing, bookings, and revenue
- **Employees** — Discover, organize, and join sports activities
- **Platform Admins** — Oversee the marketplace and revenue

Teamat creates a **three-sided marketplace** where companies subsidize employee sports, businesss fill venue capacity, and employees get affordable, organized sports experiences — generating platform revenue through booking commissions.

---

## 2. The Problem

| Pain Point | Who Suffers |
|---|---|
| Employees lack organized, affordable sports opportunities through work | Employees |
| HR departments have no tools to manage wellness budgets or measure ROI | Companies |
| Sports venues have idle venue capacity during off-peak hours | businesss |
| No platform connects corporate wellness budgets with sports venues | Market Gap |
| Employee engagement & retention is a growing concern for enterprises | Companies |
| Organizing group sports is manual, fragmented, and time-consuming | Everyone |

---

## 3. The Solution — Teamat Platform

### 3.1 How It Works

```
Company                    Teamat Platform                  Sports business
   │                            │                               │
   ├── Registers & Onboards ──► │                               │
   │                            │ ◄── Registers & Lists venues ─┤
   ├── Creates Communities ───► │                               │
   ├── Allocates Budget ──────► │                               │
   │                            │                               │
   │    Employees               │                               │
   │    ├── Join Communities    │                               │
   │    ├── Create Events ────► │ ──── Booking Request ────────►│
   │    │                       │ ◄─── Approve/Propose Alt ────┤
   │    ├── Participate         │                               │
   │    └── Compete in Leagues  │                               │
   │                            │                               │
   │    ◄── Analytics & Reports │ ──── Settlement & Revenue ──►│
```

### 3.2 Revenue Model

Teamat earns revenue through **commission on every booking**:

- Each business sets a **commission rate** (e.g., 10-15%)
- When an event is confirmed, the platform calculates:
  - **Gross Amount** = Total venue booking cost
  - **Commission** = Gross × Commission Rate
  - **Net to business** = Gross − Commission
- Settlements are tracked and paid periodically (pending → processing → paid)
- Full financial transparency through **Platform Revenue** tracking per event

---

## 4. Platform Features — Detailed Breakdown

### 4.1 Company Portal (HR Management)

#### Employee & Organization Management
- **Employee onboarding** via email invitations with secure activation tokens
- **Auto-association** — employees registering with the company email domain are automatically linked
- **Department management** — create organizational departments for team-based competitions
- **Employee directory** with filters by status, department, and search

#### Sports Community Management
- **Create communities** organized by sport (Football, Tennis, Padel, Basketball, etc.)
- **Assign community leaders** who serve as captains and organizers
- **Community budgets** — allocate funds from the company wallet to specific communities
- Communities are the organizational unit for events, leagues, and social engagement

#### Financial Management — Wallet System
- **Digital wallet** for each company with credit/debit tracking
- **Charge wallet** — top up the company wellness budget
- **Distribute funds** — allocate budgets to specific community balances
- **Full transaction history** — every credit, debit, and event charge is tracked
- **Cost splitting logic**:
  - Community balance covers what it can (company subsidy)
  - Remaining cost is split equally among participants
  - Employees pay only the gap, making sports significantly more affordable

#### Analytics & Reporting
- **Participation rate** — percentage of employees actively engaged in communities
- **Community participation rates** — members vs total employees per community
- **Budget utilization** — credited vs distributed vs spent, with utilization percentage
- **Most active community** — ranked by completed events
- **Activity leaderboard** — top-performing employees and departments
- **Activity logs** — full audit trail of all actions (events created, approved, budgets moved)
- **Exportable reports** for management presentations

#### Event Oversight
- View all company events with filters (status, community, business, date range)
- **Accept or reject business alternatives** on behalf of the organization
- Add or remove members from events
- Cancel events with automatic community balance refunds

#### League Management (View)
- Monitor inter-departmental tournaments
- View standings, match results, and brackets

---

### 4.2 business Portal (Sports Venue Management)

#### venue & Facility Management
- **venue CRUD** — create, update, deactivate venues by sport type
- **venue statuses** — Active, Closed, Maintenance
- **Multi-sport support** — each venue is linked to a specific sport

#### Dynamic Pricing Engine
- **Flexible pricing tiers** per venue:
  - Duration-based (60min, 90min, 120min)
  - **Peak / Off-Peak** pricing with labels
  - **Time-range pricing** (e.g., 6PM-10PM = peak rate)
  - **Day-specific pricing** (e.g., weekends vs weekdays)
- Pricing can be toggled active/inactive without deletion
- Supports the full range of real-world venue pricing models

#### Discount System
- **Create targeted discounts** for specific companies or communities
- **Discount types**: Fixed amount or Percentage
- **Usage modes**: One-time use or Date-range based
- **Time restrictions**: Limit discounts to specific hours
- Discounts auto-apply during event creation when conditions match

#### Booking Management Workflow
- **Receive booking requests** from employee-created events
- **Three response options**:
  1. **Approve** — confirm the booking
  2. **Reject** — decline with a reason
  3. **Propose Alternative** — suggest a different date, time, or venue count
- Alternatives create a negotiation flow until both parties agree

#### Schedule & Calendar
- **Weekly calendar grid** showing all venues and their bookings
- Visual overview of venue utilization across the week
- See company names, sports, participant counts per slot

#### Financial Settlements
- **Settlement tracking** by period (monthly)
- **Breakdown**: Gross amount → Commission deduction → Net payout
- **Settlement statuses**: Pending → Processing → Paid
- **Totals dashboard**: Received, Pending, Processing amounts

---

### 4.3 Employee Portal (Mobile-First Experience)

#### Personalized Home Dashboard
- **Greeting with notification bell** and profile avatar
- **Activity stats card**: Streak, total events, monthly events, top sport
- **Active challenges** with progress bars
- **My communities** carousel with quick access
- **Quick matches** section for spontaneous games
- **Upcoming events** with community filter pills
- **Leaderboard** — top employees, departments, and communities

#### Event Creation (Multi-Step Wizard)
- Step 1: Select community
- Step 2: Choose business and venues
- Step 3: Set date, time, and capacity
- Step 4: Review pricing with automatic discount matching
- **Live cost breakdown**: Total → Discount → Community subsidy → Per-person cost
- Automatic notifications to all community members on creation

#### Event Participation
- **Join / Leave** events with real-time capacity tracking
- **Capacity bar** showing current vs maximum participants
- View participant list with avatars
- **Alternative management** — accept or reject business-proposed schedule changes
- Event creator can **remove members** if needed

#### Community Engagement
- **Explore & join** communities within the company
- **Announcements** — captains post updates, all members receive notifications
- **Polls** — create surveys for community decisions (time preferences, venue votes)
  - Options, voting, expiration dates
  - Real-time vote counts
- **Member directory** with roles (Captain, Member)

#### League System — Inter-Departmental Competitions
- **Three tournament formats**:
  1. **Single Round-Robin** — every department plays every other once
  2. **Double Round-Robin** — home and away fixtures
  3. **Knockout (Single Elimination)** — bracket-style tournament with seeding
- **Standings table** with points (Win=3, Draw=1, Loss=0), goal difference
- **Match result recording** with score entry
- **Knockout brackets** with automatic winner advancement
- **Third-place match** for 4+ team knockout tournaments
- **Penalty shootout support** for knockout draws

#### Quick Match — Spontaneous Game Organization
- **Post a quick match request** with preferred date/time and message
- **Community members express interest** with a single tap
- **Convert to full event** when enough interest — auto-joins interested players
- **Auto-suggestions** — system automatically creates quick match suggestions for inactive communities (7+ days without events)

#### Gamification — Challenges & Streaks
- **Monthly challenges**: "Attend 3 events this month", "Join 5 events"
- **Progress tracking** with visual progress bars
- **Auto-completion** when targets are met
- **Activity streak** — consecutive weeks of participation (Saturday-based)
- **Leaderboard rankings** — employees, departments, communities ranked monthly

#### Notifications Center
- **Real-time notifications** for events, communities, leagues, and system alerts
- **Weekly digest** — automated summary every Sunday:
  - Upcoming events count
  - New community members
  - League matches played
  - Current activity streak
- **Inactivity nudges** — gentle reminders for inactive employees
- **Mark as read** — individual and bulk actions

#### Profile Management
- **Avatar upload** with image cropping
- **Personal stats**: Events participated, communities joined, events created
- **Activity streak** display
- **Event history** and **community memberships**

---

### 4.4 Admin Portal (Platform Management)

#### Marketplace Oversight
- **Company management** — approve/reject registrations, reset passwords
- **business management** — approve/reject registrations, manage status
- **Employee oversight** — view all employees across all companies
- **Community monitoring** — view all communities across the platform

#### Onboarding Workflow
- Companies and businesss **self-register** → status set to **Pending**
- Admin **reviews and approves** → generates secure activation token
- Activation email sent → entity sets password and goes live
- **Rejection flow** with status tracking

#### Revenue & Finance Dashboard
- **Monthly revenue breakdown** — commission earned per month
- **Per-company breakdown** — revenue contribution by company
- **Settlement overview** — collected vs pending vs processing
- **Gross / Commission / Net** totals across the platform

#### Sports Management
- Manage the catalog of available sports
- Each sport has: Arabic name, English name, icon, color
- Soft-delete with restore capability

#### Event Management
- View **all events across the platform** with filters
- Cancel or delete events when necessary
- Full visibility into event details, participants, and financials

#### Notification System
- **Create and send notifications** to companies, businesss, or employees
- **System-wide announcement** capability

---

## 5. Automation & Intelligence

| Feature | Trigger | Action |
|---|---|---|
| **Weekly Digest** | Every Sunday 6PM | Sends personalized activity summary to all employees |
| **Inactivity Nudges** | Daily 10AM | Notifies inactive employees (7+ days), inactive community leaders (14+ days), new members with no activity (7+ days) |
| **Challenge Generation** | Monthly (1st) | Auto-creates "Attend 3 events" and "Attend 5 events" challenges |
| **Quick Match Suggestions** | Daily 9AM | Auto-creates quick match ideas for communities inactive 7+ days |
| **Auto-Join from Quick Match** | On event creation | Interested quick match members auto-join the new event |
| **Alternative Cascade** | On accept/reject | Recalculates pricing, resets participants, notifies all stakeholders |
| **Streak Calculation** | On dashboard load | Computes consecutive participation weeks in real-time |

---

## 6. Technical Architecture

### Stack
| Layer | Technology |
|---|---|
| **Backend** | Laravel (PHP) — MVC with Service Layer |
| **Frontend** | React 19 + TypeScript |
| **Bridge** | Inertia.js 3 (SPA feel, server routing) |
| **Styling** | Tailwind CSS 4 + Radix UI (Shadcn) |
| **Database** | MySQL/PostgreSQL with migrations |
| **Build** | Vite 8 with HMR |
| **Auth** | Multi-guard session authentication (4 guards) |
| **Scheduling** | Laravel Task Scheduler (cron-based) |

### Architecture Highlights
- **Multi-tenant by design** — company data is fully isolated via foreign keys
- **Service layer pattern** — clean separation of business logic from controllers
- **Polymorphic notifications** — single system serves all 4 user types
- **Atomic financial transactions** — wallet operations use database transactions
- **RTL-first** — built for Arabic (Right-to-Left) from the ground up
- **Mobile-first employee portal** — optimized for smartphone usage
- **Responsive admin/company/business portals** — collapsible sidebar, desktop-optimized

---

## 7. Key Benefits by Stakeholder

### For Companies
- **Measurable wellness ROI** — track participation rates, budget utilization, and engagement trends
- **Subsidize employee sports affordably** — wallet system with community-level budget control
- **Build company culture** — inter-departmental leagues, community engagement, activity challenges
- **Reduce HR overhead** — self-service employee onboarding, automated notifications, zero manual coordination
- **Retention & engagement** — gamification, streaks, and leaderboards keep employees motivated
- **Data-driven decisions** — exportable reports for management and board presentations

### For Sports businesss
- **Fill idle capacity** — corporate bookings during off-peak hours
- **Predictable B2B revenue** — recurring corporate clients vs individual walk-ins
- **Flexible pricing control** — peak/off-peak, duration-based, day-specific pricing
- **Promotional tools** — targeted discounts for specific companies or communities
- **Transparent financials** — clear settlement tracking with commission breakdowns
- **Reduced no-shows** — company-backed bookings with participant tracking

### For Employees
- **Affordable sports** — company subsidies reduce personal costs significantly
- **Zero coordination effort** — events organized through the app, not WhatsApp groups
- **Social connection** — communities, announcements, polls, and leagues build real bonds
- **Competitive fun** — leagues with standings, brackets, and match results
- **Personal growth tracking** — streaks, challenges, and leaderboard rankings
- **Mobile-first experience** — designed for the way people actually use apps

### For the Platform (Teamat)
- **Commission-based revenue** — earns on every confirmed booking
- **Network effects** — more companies → more business demand → more businesss join → more companies attracted
- **Low marginal cost** — SaaS model scales without proportional cost increase
- **Data moat** — deep engagement data creates switching costs
- **Expansion potential** — new sports, new cities, new corporate wellness services

---

## 8. Competitive Advantages

### 1. Three-Sided Marketplace
Unlike simple booking apps, Teamat connects **companies, businesss, and employees** in a value loop where each participant benefits from the others' presence.

### 2. Corporate Wellness Integration
Not just a booking tool — Teamat is a **complete corporate wellness platform** with budgets, analytics, gamification, and community management built in.

### 3. Smart Cost Splitting
The **automated cost calculation** (community subsidy → company wallet → per-person split) makes sports affordable while keeping finances transparent.

### 4. Gamification Engine
**Challenges, streaks, leaderboards, and leagues** drive sustained engagement beyond initial novelty — solving the wellness program drop-off problem.

### 5. Automation Layer
**Weekly digests, nudges, auto-challenges, and quick match suggestions** keep the platform active with minimal manual effort from HR or community leaders.

### 6. Full Tournament System
**Round-robin and knockout leagues** with standings, brackets, penalties, and match recording create a competitive ecosystem that keeps employees coming back.

### 7. Negotiation Workflow
The **booking request → approve/reject/propose alternative** flow mirrors real-world venue negotiations digitally, eliminating phone calls and misunderstandings.

### 8. Arabic-First, RTL-Native
Built for the **Saudi/GCC market** from day one — not a localized afterthought. Full Arabic interface with RTL design.

### 9. Multi-Portal Architecture
**Four dedicated portals** ensure each user type gets an optimized experience rather than a one-size-fits-all interface.

### 10. Mobile-First Employee Experience
The employee portal is designed as a **mobile app experience** with bottom navigation, gesture-friendly cards, and optimized for smartphone use — where employees actually are.

---

## 9. Market Opportunity

### Target Market: Saudi Arabia & GCC
- **Saudi Vision 2030** prioritizes sports, wellness, and quality of life
- **Corporate wellness** is a rapidly growing sector in the region
- Growing number of **sports facilities** (padel, football, tennis businesss)
- **Young, tech-savvy workforce** comfortable with mobile apps
- **Large corporate sector** with employee engagement mandates

### Total Addressable Market
- **Companies**: Thousands of medium-to-large enterprises in KSA
- **Sports businesss**: Hundreds of venues across major cities
- **Employees**: Millions of corporate workers seeking sports activities

### Growth Vectors
1. **Geographic expansion** — city by city across KSA, then GCC
2. **Sport expansion** — add new sports as businesss onboard
3. **Feature expansion** — individual bookings, fitness tracking, corporate tournaments
4. **Revenue expansion** — premium plans, sponsored challenges, venue advertising

---

## 10. Current Platform Status

### Built & Functional
- All 4 portals fully implemented and functional
- Complete event lifecycle (creation → booking → approval → completion)
- Financial system (wallets, settlements, commissions)
- League system (round-robin + knockout with full bracket logic)
- Gamification (challenges, streaks, leaderboards)
- Automation (weekly digests, nudges, auto-challenges, quick match suggestions)
- Multi-guard authentication with secure onboarding flows
- Notification system across all user types
- Community features (announcements, polls, member management)

### Test Data Scale
- 4 sports, 6 businesss, 5 companies, 25 employees, 5 communities
- Active leagues, settlements, challenges, and financial transactions
- Ready for demo and pilot deployment

---

## 11. Summary

**Teamat** is a ready-to-deploy corporate sports platform that solves a real, growing need in the Saudi/GCC market. It combines **marketplace economics** (commission revenue), **SaaS stickiness** (corporate tools + data), and **consumer engagement** (gamification + mobile experience) into a single platform.

The platform is **fully built**, covers the **complete user journey** for all stakeholders, and is designed for the **local market** from the ground up.

**We're seeking to:**
- Launch pilot programs with initial corporate partners
- Onboard sports venues across target cities
- Scale the engineering team for mobile app development (native iOS/Android)
- Marketing and sales to acquire corporate clients
- Expand features: individual bookings, fitness integrations, corporate wellness dashboards

---

*Document generated from Teamat platform codebase analysis — May 2026*
