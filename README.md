# CorpMind AI — Enterprise AI Operations & Workflow Automation Platform

**CorpMind AI** is an enterprise-grade AI-powered command center and operations automation platform. It unifies fragmented corporate data and cross-departmental workflows across **Operations, Finance, Human Resources, and Customer Support** by pairing official Google Gemini models (`gemini-2.5-flash` and `gemini-2.5-pro`) via `@google/genai` with strict Row-Level Security (RLS) data isolation and multi-agent workflow orchestration.

---

## 🏛️ System Architecture & Separation

The platform is strictly structured with a clear differentiation between frontend and backend:

```
corpmind-ai/
├── frontend/                   # FRONTEND FOLDER (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # KPICard, Navbar, Sidebar, WorkflowBuilder,
│   │   │                       # DocumentUploadModal, ChatInterface, AnalyticsChart
│   │   ├── context/            # AuthContext (Instant RLS role switcher), ToastContext
│   │   ├── pages/              # Dashboard, Workspace, Documents, Workflows, Chat, Analytics, Settings, Login
│   │   ├── services/           # api.js client with JWT injection & error handling
│   │   ├── validators/         # Self-contained Zod schemas
│   │   ├── App.jsx             # React Router v6 & ProtectedLayout
│   │   ├── index.css           # Modern enterprise glassmorphic styles & Inter font
│   │   └── main.jsx
│   ├── tailwind.config.js      # Corporate color palette, dark mode & glow effects
│   ├── vite.config.js          # Reverse proxy to backend API & static uploads
│   └── package.json            # Frontend dependencies
│
├── backend/                    # BACKEND FOLDER (Node.js + Express + PostgreSQL + @google/genai)
│   ├── config/
│   │   ├── db.js               # PostgreSQL pool + Resilient Local RLS data adapter
│   │   └── schema.sql          # Production SQL schema, UUIDs, indexes & RLS policies
│   ├── controllers/            # authController, documentController, workflowController,
│   │                           # aiController, analyticsController, settingsController
│   ├── middleware/             # auth.js (JWT verify, role & department RLS claims)
│   ├── routes/                 # Express API routes (/auth, /documents, /workflows, /ai, /analytics, /settings)
│   ├── services/
│   │   └── gemini.js           # Google Gemini official SDK (@google/genai), fallback synthesis & schema extraction
│   ├── validators/             # Self-contained Zod schemas
│   ├── scripts/
│   │   └── init-db.js          # PostgreSQL migration & admin seeding script
│   ├── uploads/                # Ingested PDF, text, and image documents
│   ├── server.js               # Main Express entrypoint (rate-limiting, CORS, security headers)
│   └── package.json            # Backend dependencies
│
├── shared/                     # Canonical schema references
├── package.json                # Root monorepo orchestration (concurrently dev scripts)
└── .env                        # Environment secrets & database connection
```

---

## 🚀 Quick Start Guide

### 1. Install & Run Everything

From the project root:

```bash
# 1. Install root dependencies
npm install

# 2. Run both Backend Server (port 5000) and Frontend Client (port 5173) concurrently:
npm run dev
```

The frontend will be available at: **http://localhost:5173**  
The backend API is available at: **http://localhost:5000/api**

---

## 👥 Demo Personas & Instant RLS Switching

To allow instant testing of Row-Level Security data boundaries, CorpMind AI includes pre-seeded demo accounts accessible via 1-click buttons directly on the Login screen and in the Navbar persona switcher:

| Persona | Role | Department | Access Scope |
| :--- | :--- | :--- | :--- |
| **Elena Rostova** | `admin` | `executive` | **Unrestricted RLS Access** across all departments, audit logs, and workflow controls |
| **Marcus Vance** | `manager` | `operations` | Logistics SLA telemetry, freight route optimization, carrier anomaly triggers |
| **Sophia Chen** | `manager` | `finance` | Invoice compliance validation, $10k+ spend approvals, budget risk variance |
| **David Miller** | `manager` | `hr` | Candidate dossier analysis, Day-1 automated onboarding provisioning, EEO compliance |
| **Sarah Jenkins** | `manager` | `support` | Ticket auto-categorization, customer sentiment tracking, P0/P1 escalation postmortems |
| **Alex Rivera** | `employee` | `operations` | Standard contributor role with strict department data isolation |

*Default password for all demo accounts:* `password123`

---

## 🧠 Google Gemini AI Integration (`@google/genai`)

CorpMind AI utilizes the official Google Gen AI SDK (`@google/genai`):

1. **High-Speed Multimodal Co-Pilot (`gemini-2.5-flash`)**:
   - Powers the conversational assistant in `/chat`.
   - Links uploaded department documents into structured prompt context (RAG-lite).
   - Generates executive operational summaries and automated Day-1 onboarding checklists.

2. **Deep Document & Risk Reasoning (`gemini-2.5-pro`)**:
   - Ingests invoices, SLAs, and candidate dossiers in `/documents`.
   - Extracts structured JSON strictly adhering to the schema (`supplierName`, `totalAmount`, `dueDate`, `lineItems`, `riskScore`, `complianceNotes`).
   - Automatically calculates risk scores (0–100) and triggers automated workflows when thresholds are exceeded.

3. **Resilient AI Degradation & Fallbacks**:
   - If the `GEMINI_API_KEY` is not yet configured or hits quota limits, the backend returns structured fallback JSON conforming to the exact schema without crashing.
   - You can configure and test your live Gemini API key directly from the `/settings` UI page or in `.env`.

---

## 🔒 Database Schema & Row-Level Security (RLS)

Production PostgreSQL schema is defined in `server/config/schema.sql`:

```sql
-- Enable RLS on core tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Document Isolation Policy: Admin sees all, users see only their department
CREATE POLICY document_isolation_policy ON documents
    FOR ALL
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin' 
        OR department::text = current_setting('request.jwt.claim.department', true)
    );

-- Workflow Isolation Policy
CREATE POLICY workflow_isolation_policy ON workflows
    FOR ALL
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin' 
        OR department::text = current_setting('request.jwt.claim.department', true)
    );
```

*Note on Local Resilience:* If an external PostgreSQL database is not reachable on `localhost:5432`, the backend's data adapter seamlessly operates in local enterprise store mode with full RLS emulation, ensuring zero setup friction.

---

## 📊 Application Pages & Routes

- `/login` — Authentication page with 1-click persona switcher and corporate account registration.
- `/dashboard` — Executive command center featuring KPIs, live throughput charts, recent documents, and system health status.
- `/workspace` — Multi-departmental command hub with dedicated views for Operations, Finance, HR, and Support.
- `/documents` — Document ingestion portal with PDF/Image/TXT upload, OCR text editor, Gemini JSON schema extraction review, and risk badges.
- `/workflows` — Automated rule builder (trigger events + multi-step AI execution chains) with an interactive execution trace tester.
- `/chat` — Multi-turn conversational assistant with document context linking, markdown rendering, token counters, and prompt suggestions.
- `/analytics` — Recharts graphs for token consumption, throughput, and searchable audit logs.
- `/settings` — Gemini API key tester & manager, PostgreSQL connection health, and RBAC matrix.
