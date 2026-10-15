# 🎨 CorpMind AI — Frontend Application (Client)

The frontend is a modern, responsive Single Page Application (SPA) designed as an executive AI command center.

---

## 📌 Technology Stack

- **Framework**: React 18 / 19
- **Build Tool & Dev Server**: Vite (`http://localhost:5173`)
- **Routing**: React Router v6 (`BrowserRouter`, `ProtectedLayout`, route guards)
- **Styling**: Vanilla Tailwind CSS with custom corporate dark mode tokens, glowing accents, and glassmorphic panels
- **Visual Analytics**: Recharts (Throughput area charts, token usage bar charts, risk distribution pie charts)
- **Iconography**: Lucide React
- **Validation**: Zod (runtime type checking matching backend schemas)

---

## 🗂️ Directory Architecture

```
client/
├── public/                 # Static assets (logo.svg, icons)
├── src/
│   ├── components/         # Reusable presentation & feature components
│   │   ├── common/         # DepartmentBadge.jsx, RiskBadge.jsx
│   │   ├── KPICard.jsx     # Glowing metric cards with trend indicators
│   │   ├── Navbar.jsx      # Top header, role switcher & notification center
│   │   ├── Sidebar.jsx     # Navigation bar with active state glow
│   │   ├── DocumentUploadModal.jsx # Ingestion modal with OCR text editor
│   │   ├── WorkflowBuilder.jsx     # Visual node builder for automation rules
│   │   ├── ChatInterface.jsx       # Multi-turn co-pilot with markdown formatting
│   │   └── AnalyticsChart.jsx      # Recharts wrappers
│   ├── context/
│   │   ├── AuthContext.jsx # User state, JWT storage, instant demo persona switcher
│   │   └── ToastContext.jsx # Global animated notification toasts
│   ├── pages/              # Top-level view routes
│   │   ├── LoginPage.jsx   # Authentication with 1-click persona switching
│   │   ├── DashboardPage.jsx # Executive KPI command center & throughput
│   │   ├── WorkspacePage.jsx # Multi-departmental hub (Ops, Finance, HR, Support)
│   │   ├── DocumentsPage.jsx # Ingestion portal & Gemini extraction review
│   │   ├── WorkflowsPage.jsx # Automation rule builder & execution trace tester
│   │   ├── ChatPage.jsx      # AI co-pilot with document context grounding
│   │   ├── AnalyticsPage.jsx # Telemetry charts & searchable audit logs
│   │   └── SettingsPage.jsx  # Gemini API key manager & RBAC matrix
│   ├── services/
│   │   └── api.js          # REST client with automatic JWT bearer injection
│   ├── App.jsx             # Route definitions & protected layout
│   ├── index.css           # Glassmorphism, custom scrollbars, Inter font
│   └── main.jsx            # React root mount
├── package.json            # Client dependencies and scripts
├── tailwind.config.js      # Enterprise dark mode color system
└── vite.config.js          # Reverse proxy to backend (http://localhost:5000)
```

---

## 🔒 Security & Client Boundaries

- **Zero Secrets on Client**: The client bundle contains **NO** database credentials, **NO** JWT signing secrets, and **NO** Gemini API keys.
- **Stateless Authentication**: Sessions are managed via short-lived JWT tokens saved in `localStorage` and sent via `Authorization: Bearer <token>` on all `/api/*` calls.
- **Client-Side Validation**: All forms (login, upload, workflow, chat) are validated against shared Zod schemas before network dispatch.

---

## 💻 Commands

```bash
# Run client dev server (port 5173)
npm run dev

# Build client production bundle
npm run build

# Preview production build locally
npm run preview
```
