# ⚙️ CorpMind AI — Backend Architecture (Server)

The backend is an enterprise Node.js & Express service that handles business logic, database transactions, Row-Level Security (RLS) enforcement, multi-agent AI orchestration, and audit trails.

---

## 📌 Technology Stack

- **Runtime**: Node.js v20+ (ES Modules)
- **Framework**: Express.js (`http://localhost:5000`)
- **Database Driver**: `pg` (PostgreSQL Client with Connection Pooling)
- **Database Engine**: PostgreSQL with Row-Level Security (RLS) & local resilient adapter
- **AI Engine**: `@google/genai` (Official Google Gen AI SDK utilizing `gemini-2.5-flash` and `gemini-2.5-pro`)
- **Authentication**: JWT (`jsonwebtoken`) with salted Bcrypt password hashing (`bcryptjs` with 12 rounds)
- **File Uploads**: `multer` (Multipart document ingestion with 25MB limits)
- **Rate Limiting**: `express-rate-limit` (300 requests per 15-minute window)
- **Validation**: Zod (Runtime input validation matching shared schemas)

---

## 🗂️ Directory Architecture

```
server/
├── config/
│   ├── db.js               # PostgreSQL connection pool + resilient local RLS adapter
│   └── schema.sql          # Production SQL schema, UUIDs, indexes & RLS policies
├── controllers/
│   ├── authController.js   # Login, registration, token generation, user profiles
│   ├── documentController.js # Upload processing, Gemini extraction & risk calculation
│   ├── workflowController.js # Workflow rule creation, status toggling, simulated triggers
│   ├── aiController.js     # Conversational assistant & document risk reasoning
│   ├── analyticsController.js # KPIs aggregation & immutable audit log queries
│   └── settingsController.js  # Gemini API key testing, health check & diagnostics
├── middleware/
│   └── auth.js             # JWT bearer verification & RLS session claims injector
├── routes/
│   ├── authRoutes.js       # /api/auth/*
│   ├── documentRoutes.js   # /api/documents/*
│   ├── workflowRoutes.js   # /api/workflows/*
│   ├── aiRoutes.js         # /api/ai/*
│   ├── analyticsRoutes.js  # /api/analytics/*
│   └── settingsRoutes.js   # /api/settings/*
├── scripts/
│   └── init-db.js          # PostgreSQL schema migration & admin seeding script
├── services/
│   └── gemini.js           # Google Gemini SDK service with schema extraction & fallbacks
├── uploads/                # Local directory for uploaded invoice & contract files
├── server.js               # Main Express entrypoint (rate-limiting, CORS, error handling)
└── package.json            # Server dependencies and scripts
```

---

## 🛡️ Row-Level Security (RLS) & Data Isolation

Data isolation is guaranteed at the database level:

```sql
-- Policies enforce that users only read and mutate rows in their department,
-- while 'admin' users in the 'executive' department have cross-organizational access:
CREATE POLICY document_isolation_policy ON documents
    FOR ALL
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin' 
        OR department::text = current_setting('request.jwt.claim.department', true)
    );
```

Before executing queries, the database adapter sets the session claims extracted from the verified JWT:
`SET LOCAL request.jwt.claim.role = $1; SET LOCAL request.jwt.claim.department = $2;`

---

## 🌐 API Route Specification

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate with email/password; returns JWT | No |
| `POST` | `/api/auth/register` | Register new corporate account | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/documents` | Fetch documents (filtered by RLS) | Yes |
| `POST` | `/api/documents/upload` | Ingest file or text, run Gemini entity extraction | Yes |
| `GET` | `/api/workflows` | List automated workflows (filtered by RLS) | Yes |
| `POST` | `/api/workflows` | Create new automation rule | Yes (Manager/Admin) |
| `POST` | `/api/workflows/:id/trigger` | Execute interactive workflow test trace | Yes |
| `POST` | `/api/ai/chat` | Conversational query with RAG-lite document context | Yes |
| `POST` | `/api/ai/analyze` | Deep document risk analysis with Gemini 2.5 Pro | Yes |
| `GET` | `/api/analytics/metrics` | Return aggregated KPIs and Recharts throughput | Yes |
| `GET` | `/api/analytics/audit-logs`| Return immutable audit log records | Yes |
| `GET` | `/api/settings/health` | Check PostgreSQL and Gemini SDK connectivity | No |
| `POST` | `/api/settings/api-key` | Test and configure runtime Gemini API key | Yes (Admin) |

---

## 💻 Commands

```bash
# Start backend server in dev mode with file watcher (port 5000)
npm run dev

# Start backend server in production mode
npm start

# Run PostgreSQL schema migration and seed admin
npm run init-db
```
