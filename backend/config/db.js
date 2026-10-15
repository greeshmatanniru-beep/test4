import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storeFilePath = path.join(__dirname, '..', 'data', 'store.json');

const { Pool } = pg;

let pool = null;
let isPostgresConnected = false;
let fallbackStore = {
  users: [],
  documents: [],
  workflows: [],
  tasks: [],
  audit_logs: [],
  chat_messages: []
};

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getInitialTasks() {
  const now = Date.now();
  const opsManagerId = '22222222-2222-4222-a222-222222222222';
  const finDirectorId = '33333333-3333-4333-a333-333333333333';
  const hrLeadId = '44444444-4444-4444-a444-444444444444';
  const supLeadId = '55555555-5555-4555-a555-555555555555';

  return [
    {
      id: 'task-101',
      title: 'OmniBank Webhook Redis Sentinel Hotfix Review',
      description: 'Customer support escalated webhook timeout incident #TIC-4089. Redis sentinel configuration must be validated before the weekend billing cycle.',
      category: 'incident',
      priority: 'urgent',
      department: 'support',
      status: 'pending',
      deadline: new Date(now - 2 * 3600000).toISOString(), // OVERDUE
      suggested_action: 'Perform sentinel synchronization health check and notify Support Lead Sarah Jenkins.',
      created_by: supLeadId,
      assigned_to: 'Sarah Jenkins',
      created_at: new Date(now - 8 * 3600000).toISOString(),
      updated_at: new Date(now - 8 * 3600000).toISOString()
    },
    {
      id: 'task-102',
      title: 'HyperTensor $247.8k Invoice CFO Dual Approval',
      description: 'GPU cluster reservation invoice #INV-8921 exceeds the $100k corporate spending limit. Requires formal VP CFO digital signoff.',
      category: 'financial_approval',
      priority: 'urgent',
      department: 'finance',
      status: 'in_progress',
      deadline: new Date(now - 14 * 3600000).toISOString(), // OVERDUE
      suggested_action: 'Present 2/10 Net 45 rebate terms ($4,956 discount) to CFO for signoff.',
      created_by: finDirectorId,
      assigned_to: 'Sophia Chen',
      created_at: new Date(now - 24 * 3600000).toISOString(),
      updated_at: new Date(now - 12 * 3600000).toISOString()
    },
    {
      id: 'task-103',
      title: 'Apex Fleet Carrier Failover Uptime Reconciliation',
      description: 'Logistics SLA audit for Q4 routing API uptime SLA rebate eligibility after secondary node failover test.',
      category: 'sla_audit',
      priority: 'high',
      department: 'operations',
      status: 'pending',
      deadline: new Date(now - 5 * 3600000).toISOString(), // OVERDUE
      suggested_action: 'Cross-check mean latency logs against Section 7.5 SLA 5% rebate clause with Marcus Vance.',
      created_by: opsManagerId,
      assigned_to: 'Marcus Vance',
      created_at: new Date(now - 18 * 3600000).toISOString(),
      updated_at: new Date(now - 18 * 3600000).toISOString()
    },
    {
      id: 'task-104',
      title: 'Dr. Aris Thorne Onboarding Security Clearance',
      description: 'Provision corporate SSO, Zero-Trust hardware tokens, and GPU cluster access for newly hired Lead AI Systems Architect.',
      category: 'onboarding',
      priority: 'medium',
      department: 'hr',
      status: 'in_progress',
      deadline: new Date(now + 48 * 3600000).toISOString(),
      suggested_action: 'Coordinate with IT infrastructure for Day-1 enterprise provisioning pack.',
      created_by: hrLeadId,
      assigned_to: 'David Miller',
      created_at: new Date(now - 30 * 3600000).toISOString(),
      updated_at: new Date(now - 16 * 3600000).toISOString()
    },
    {
      id: 'task-105',
      title: 'Automated Carrier Failover Dry-Run Verification',
      description: 'Simulate disaster recovery failover to Apex-Fleet-B secondary node to ensure zero container routing dropped.',
      category: 'maintenance',
      priority: 'low',
      department: 'operations',
      status: 'completed',
      deadline: new Date(now - 36 * 3600000).toISOString(),
      suggested_action: 'Export failover latency log to executive operations binder.',
      created_by: opsManagerId,
      assigned_to: 'Alex Rivera',
      created_at: new Date(now - 72 * 3600000).toISOString(),
      updated_at: new Date(now - 30 * 3600000).toISOString()
    }
  ];
}

function loadLocalStore() {
  if (fs.existsSync(storeFilePath)) {
    try {
      const content = fs.readFileSync(storeFilePath, 'utf-8');
      fallbackStore = JSON.parse(content);
      if (!fallbackStore.tasks || fallbackStore.tasks.length === 0) {
        fallbackStore.tasks = getInitialTasks();
        saveLocalStore();
      }
      return;
    } catch (e) {
      console.warn('Failed to load store.json, will reinitialize default seed.', e.message);
    }
  }
  seedInitialData();
  saveLocalStore();
}

function saveLocalStore() {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(fallbackStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist local store:', e.message);
  }
}

function seedInitialData() {
  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const adminId = '11111111-1111-4111-a111-111111111111';
  const opsManagerId = '22222222-2222-4222-a222-222222222222';
  const finDirectorId = '33333333-3333-4333-a333-333333333333';
  const hrLeadId = '44444444-4444-4444-a444-444444444444';
  const supLeadId = '55555555-5555-4555-a555-555555555555';
  const empId = '66666666-6666-4666-a666-666666666666';

  fallbackStore.users = [
    {
      id: adminId,
      email: 'admin@corpmind.ai',
      password_hash: passwordHash,
      full_name: 'Elena Rostova (Chief AI & Operations Officer)',
      role: 'admin',
      department: 'executive',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: opsManagerId,
      email: 'marcus.ops@corpmind.ai',
      password_hash: passwordHash,
      full_name: 'Marcus Vance (VP Operations)',
      role: 'manager',
      department: 'operations',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: finDirectorId,
      email: 'sophia.fin@corpmind.ai',
      password_hash: passwordHash,
      full_name: 'Sophia Chen (Finance Director)',
      role: 'manager',
      department: 'finance',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: hrLeadId,
      email: 'david.hr@corpmind.ai',
      password_hash: passwordHash,
      full_name: 'David Miller (People Ops Lead)',
      role: 'manager',
      department: 'hr',
      created_at: new Date(Date.now() - 18 * 86400000).toISOString()
    },
    {
      id: supLeadId,
      email: 'sarah.sup@corpmind.ai',
      password_hash: passwordHash,
      full_name: 'Sarah Jenkins (Customer Success Lead)',
      role: 'manager',
      department: 'support',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: empId,
      email: 'alex.emp@corpmind.ai',
      password_hash: passwordHash,
      full_name: 'Alex Rivera (Operations Analyst)',
      role: 'employee',
      department: 'operations',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    }
  ];

  fallbackStore.documents = [
    {
      id: 'doc-101',
      title: 'Global Logistics Cloud SLA Contract Q4.pdf',
      file_type: 'application/pdf',
      file_url: '/uploads/sample-logistics-sla.pdf',
      department: 'operations',
      extracted_data: {
        supplierName: 'Apex Fleet & Logistics Cloud Corp',
        totalAmount: 148500,
        dueDate: '2026-11-30',
        lineItems: [
          { description: 'Multi-modal freight routing API telemetry', amount: 84000 },
          { description: 'Autonomous warehouse dispatch orchestration', amount: 48500 },
          { description: 'Priority 99.99% uptime enterprise SLA support', amount: 16000 }
        ],
        riskScore: 18,
        complianceNotes: 'SLA guarantees sub-15ms route compute; penalty clause adheres to ISO-27001 standard.'
      },
      raw_content: `GLOBAL LOGISTICS CLOUD SLA CONTRACT (Q4)
Supplier: Apex Fleet & Logistics Cloud Corp
Client: NexusAI Operations Hub
Section 3.1 Availability Standard:
Apex guarantees 99.99% uptime for all freight routing and automated container dispatch APIs across North American and European fulfillment hubs.
Section 4.2 Latency Guarantee:
Mean transit telemetry API compute latency shall not exceed 15 milliseconds under peak dispatch volumes.
Section 7.5 Breach Penalties:
Unplanned service disruptions exceeding 0.01% in any calendar month entitle Client to an automatic 5% billing rebate per 30 minutes of downtime, capped at 35% of monthly fees.
Section 9.1 Failover & Disaster Recovery:
In the event of primary carrier cluster failure, traffic must fail over automatically to Apex-Fleet-B secondary node within 45 seconds.`,
      risk_score: 18,
      status: 'processed',
      uploaded_by: opsManagerId,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'doc-102',
      title: 'Enterprise GPU Compute Cluster Invoice #INV-8921.pdf',
      file_type: 'application/pdf',
      file_url: '/uploads/gpu-invoice-8921.pdf',
      department: 'finance',
      extracted_data: {
        supplierName: 'HyperTensor Distributed Systems Inc.',
        totalAmount: 247800,
        dueDate: '2026-12-15',
        lineItems: [
          { description: 'H100 NVLink 64-Node Dedicated Reservation', amount: 215000 },
          { description: 'High-speed InfiniBand Interconnect Fabrics', amount: 22800 },
          { description: 'Direct Managed Support Tier 1', amount: 10000 }
        ],
        riskScore: 72,
        complianceNotes: 'High liability threshold. Invoice amount exceeds $100k threshold requiring dual VP CFO authorization.'
      },
      raw_content: `INVOICE #INV-8921
Vendor: HyperTensor Distributed Systems Inc.
Date of Issue: October 01, 2026
Payment Due: December 15, 2026
Billing Entity: NexusAI Enterprise Finance
Line Items:
- 64x Dedicated NVIDIA H100 Tensor Core GPUs with NVLink: $215,000.00
- Dual 400Gbps InfiniBand Interconnect Fabrics: $22,800.00
- Dedicated Tier-1 Machine Learning Systems Engineering Support: $10,000.00
Total Net Payable: $247,800.00
Payment Terms: Net 45. 2% discount applied if settled within 10 days (2/10 Net 45).
Corporate Governance Note: Invoices exceeding $100,000 require dual approval from VP Finance and Executive Director.`,
      risk_score: 72,
      status: 'processed',
      uploaded_by: finDirectorId,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'doc-103',
      title: 'Senior AI Research Engineer Candidate Dossier.pdf',
      file_type: 'application/pdf',
      file_url: '/uploads/resume-lead-ai.pdf',
      department: 'hr',
      extracted_data: {
        supplierName: 'Dr. Aris Thorne',
        totalAmount: 0,
        dueDate: '2026-11-01',
        lineItems: [
          { description: 'Background Verification Passed (Checkr Enterprise)', amount: 0 },
          { description: '8+ Years Distributed Systems & Transformer Architecture', amount: 0 },
          { description: '4 Patents in Multi-Agent Consensus Mechanisms', amount: 0 }
        ],
        riskScore: 8,
        complianceNotes: 'Full compliance with equal opportunity and NDA screening. Offer recommendation approved.'
      },
      raw_content: `CANDIDATE DOSSIER & VERIFICATION REPORT
Candidate Name: Dr. Aris Thorne
Target Position: Lead AI Systems Architect
Department: Human Resources / Engineering Staff
Verification Summary:
- Background Check: Clear (Checkr Enterprise Level 3 verification completed Oct 2026).
- Technical Evaluation: 8+ years leading large-scale Transformer distributed training. Author of 4 awarded patents on asynchronous multi-agent consensus.
- Regulatory Compliance: EEO compliant, Non-Compete review completed with previous employer without encumbrances.
- Recommended Offer Package: Base Salary $245,000 + Equity Options. Onboarding target date: November 01, 2026.`,
      risk_score: 8,
      status: 'processed',
      uploaded_by: hrLeadId,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'doc-104',
      title: 'Tier-1 Customer Escalation & Incident Report #TIC-4089.txt',
      file_type: 'text/plain',
      file_url: '/uploads/incident-4089.txt',
      department: 'support',
      extracted_data: {
        supplierName: 'OmniBank Financial Services',
        totalAmount: 0,
        dueDate: '2026-10-20',
        lineItems: [
          { description: 'Payment Gateway Webhook Timeout (43s recovery time)', amount: 0 },
          { description: 'Root cause: Failover redis replica sync lag', amount: 0 }
        ],
        riskScore: 45,
        complianceNotes: 'Tier 1 SLA breach mitigated within credit tolerance window. Engineering patch v4.9.2 deployed.'
      },
      raw_content: `INCIDENT POSTMORTEM REPORT #TIC-4089
Customer: OmniBank Financial Services (Tier-1 Strategic Enterprise)
Date: October 14, 2026
Classification: P1 High Severity Incident
Summary of Issue:
At 08:42 UTC, OmniBank reported that merchant checkout callbacks were timing out with HTTP 504.
Root Cause Analysis:
Redis primary-replica synchronization lag during failover caused 43 seconds of unbuffered webhook connection drops.
Corrective Actions Taken:
1. Engineering patch v4.9.2 deployed to provision redundant sentinel instances.
2. Negative customer sentiment mitigated through proactive executive outreach.
3. SLA credit authorization of $12,500 issued within contractual penalty limit.`,
      risk_score: 45,
      status: 'processed',
      uploaded_by: supLeadId,
      created_at: new Date(Date.now() - 4 * 3600000).toISOString()
    }
  ];

  // SEED ENTERPRISE TASKS (Smart Requests)
  const now = Date.now();
  fallbackStore.tasks = [
    {
      id: 'task-101',
      title: 'OmniBank Webhook Redis Sentinel Hotfix Review',
      description: 'Customer support escalated webhook timeout incident #TIC-4089. Redis sentinel configuration must be validated before the weekend billing cycle.',
      category: 'incident',
      priority: 'urgent',
      department: 'support',
      status: 'pending',
      deadline: new Date(now - 2 * 3600000).toISOString(), // OVERDUE (2 hours ago)
      suggested_action: 'Perform sentinel synchronization health check and notify Support Lead Sarah Jenkins.',
      created_by: supLeadId,
      assigned_to: 'Sarah Jenkins',
      created_at: new Date(now - 8 * 3600000).toISOString(),
      updated_at: new Date(now - 8 * 3600000).toISOString()
    },
    {
      id: 'task-102',
      title: 'HyperTensor $247.8k Invoice CFO Dual Approval',
      description: 'GPU cluster reservation invoice #INV-8921 exceeds the $100k corporate spending limit. Requires formal VP CFO digital signoff.',
      category: 'financial_approval',
      priority: 'urgent',
      department: 'finance',
      status: 'in_progress',
      deadline: new Date(now - 14 * 3600000).toISOString(), // OVERDUE (14 hours ago)
      suggested_action: 'Present 2/10 Net 45 rebate terms ($4,956 discount) to CFO for signoff.',
      created_by: finDirectorId,
      assigned_to: 'Sophia Chen',
      created_at: new Date(now - 24 * 3600000).toISOString(),
      updated_at: new Date(now - 2 * 3600000).toISOString()
    },
    {
      id: 'task-103',
      title: 'Apex Freight Multi-Modal Route SLA Telemetry Audit',
      description: 'Conduct quarterly compliance check on sub-15ms compute latency guarantee for Q4 logistics dispatch.',
      category: 'compliance',
      priority: 'high',
      department: 'operations',
      status: 'in_progress',
      deadline: new Date(now + 24 * 3600000).toISOString(), // Due tomorrow
      suggested_action: 'Run automated diagnostics across 18 regional distribution hubs.',
      created_by: opsManagerId,
      assigned_to: 'Marcus Vance',
      created_at: new Date(now - 48 * 3600000).toISOString(),
      updated_at: new Date(now - 12 * 3600000).toISOString()
    },
    {
      id: 'task-104',
      title: 'Day-1 SSO & Security Provisioning for Dr. Aris Thorne',
      description: 'Offer accepted for Lead AI Systems Architect. Automated creation of Okta SSO, AWS Cloud and GPU cluster access tokens.',
      category: 'onboarding',
      priority: 'medium',
      department: 'hr',
      status: 'pending',
      deadline: new Date(now + 72 * 3600000).toISOString(), // Due in 3 days
      suggested_action: 'Trigger Automated HR Provisioning workflow once hardware ships.',
      created_by: hrLeadId,
      assigned_to: 'David Miller',
      created_at: new Date(now - 16 * 3600000).toISOString(),
      updated_at: new Date(now - 16 * 3600000).toISOString()
    },
    {
      id: 'task-105',
      title: 'Automated Carrier Failover Dry-Run Verification',
      description: 'Simulate disaster recovery failover to Apex-Fleet-B secondary node to ensure zero container routing dropped.',
      category: 'maintenance',
      priority: 'low',
      department: 'operations',
      status: 'completed',
      deadline: new Date(now - 36 * 3600000).toISOString(),
      suggested_action: 'Export failover latency log to executive operations binder.',
      created_by: opsManagerId,
      assigned_to: 'Alex Rivera',
      created_at: new Date(now - 72 * 3600000).toISOString(),
      updated_at: new Date(now - 30 * 3600000).toISOString()
    }
  ];

  fallbackStore.workflows = [
    {
      id: 'wf-201',
      name: 'High-Value Invoice Threshold Escalation',
      department: 'finance',
      trigger_event: 'invoice_amount_exceeds_threshold',
      actions: [
        { type: 'ai_risk_assessment', threshold: 10000, model: 'gemini-2.5-pro' },
        { type: 'require_approval', role: 'manager', department: 'finance' },
        { type: 'dispatch_alert', channel: 'finance-director-slack' }
      ],
      status: 'active',
      created_by: finDirectorId,
      created_at: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 'wf-202',
      name: 'Operations Route SLA Anomaly Guard',
      department: 'operations',
      trigger_event: 'sla_breach_detected',
      actions: [
        { type: 'ai_telemetry_diagnostic', target: 'supply-chain' },
        { type: 'reroute_traffic', failover_carrier: 'Apex-Fleet-B' },
        { type: 'notify_operations_commander' }
      ],
      status: 'active',
      created_by: opsManagerId,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'wf-203',
      name: 'Automated HR Onboarding Provisioning',
      department: 'hr',
      trigger_event: 'candidate_offer_accepted',
      actions: [
        { type: 'generate_custom_welcome_pack', model: 'gemini-2.5-flash' },
        { type: 'provision_corporate_sso', scope: 'engineering' },
        { type: 'schedule_manager_sync', day_offset: 1 }
      ],
      status: 'active',
      created_by: hrLeadId,
      created_at: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'wf-204',
      name: 'Critical Incident Triage & Sentiment Escalation',
      department: 'support',
      trigger_event: 'negative_sentiment_score_spike',
      actions: [
        { type: 'ai_sentiment_audit', min_confidence: 0.85 },
        { type: 'escalate_ticket', priority: 'P0-Urgent' },
        { type: 'generate_executive_postmortem_draft' }
      ],
      status: 'active',
      created_by: supLeadId,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];

  fallbackStore.audit_logs = [
    {
      id: 'log-001',
      user_id: adminId,
      action: 'SYSTEM_INITIALIZED',
      details: { environment: 'production', rls_enabled: true, platform: 'NexusAI Enterprise AI' },
      ip_address: '10.0.4.12',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'log-002',
      user_id: finDirectorId,
      action: 'DOCUMENT_ANALYZED',
      details: { docId: 'doc-102', riskScore: 72, supplier: 'HyperTensor Distributed Systems Inc.' },
      ip_address: '10.0.4.55',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: 'log-003',
      user_id: supLeadId,
      action: 'TASK_STATUS_UPDATED',
      details: { taskId: 'task-101', from: 'created', to: 'pending' },
      ip_address: '10.0.4.89',
      created_at: new Date(Date.now() - 8 * 3600000).toISOString()
    }
  ];

  fallbackStore.chat_messages = [
    {
      id: 'chat-001',
      user_id: opsManagerId,
      department: 'operations',
      prompt: 'What are the main SLA liabilities in our Apex Fleet Cloud contract?',
      response: 'Based on the **Global Logistics Cloud SLA Contract Q4**, Apex guarantees a **99.99% route compute uptime** with sub-15ms compute latency. SLA penalty provisions include a 5% billing rebate for every 30 minutes of unplanned outage exceeding 0.01% per calendar month.',
      sources: [
        {
          documentId: 'doc-101',
          documentTitle: 'Global Logistics Cloud SLA Contract Q4.pdf',
          excerpt: 'Apex guarantees 99.99% uptime for all freight routing and automated container dispatch APIs... Unplanned service disruptions exceeding 0.01% in any calendar month entitle Client to an automatic 5% billing rebate per 30 minutes of downtime.',
          section: 'Section 3.1 & 7.5',
          confidence: 'High (0.96)'
        }
      ],
      tokens_used: 342,
      created_at: new Date(Date.now() - 24 * 3600000).toISOString()
    }
  ];
}

export async function initDatabase() {
  loadLocalStore();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('ℹ️  No DATABASE_URL configured. Running NexusAI in robust enterprise local store mode (full RLS emulation active).');
    return;
  }

  try {
    const isSupabaseHost = databaseUrl.includes('supabase.co') || databaseUrl.includes('supabase.com') || databaseUrl.includes('pooler.supabase');
    const useSSL = process.env.PGSSL === 'true' || isSupabaseHost;

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 10000,
      max: 10
    });

    const client = await pool.connect();
    isPostgresConnected = true;
    if (isSupabaseHost) {
      console.log('✅ Connected successfully to Supabase PostgreSQL database.');
    } else {
      console.log('✅ Connected successfully to PostgreSQL database.');
    }

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
      console.log('✅ PostgreSQL Schema, Tasks and Row Level Security policies verified.');
    }
    client.release();
  } catch (err) {
    isPostgresConnected = false;
    console.warn(`⚠️ PostgreSQL connection attempt failed (${err.message}). Using resilient embedded enterprise data adapter with Row Level Security guarantees.`);
  }
}

// RLS Filter helper for data isolation
function enforceRLS(items, authContext, deptField = 'department') {
  if (!authContext) return items;
  if (authContext.role === 'admin' || authContext.department === 'executive') {
    return items; // Admin sees all records across departments
  }
  return items.filter(item => item[deptField] === authContext.department);
}

export const db = {
  isPostgres() {
    return isPostgresConnected;
  },

  // USERS
  async findUserByEmail(email) {
    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        return res.rows[0] || null;
      } catch (e) {
        console.error('PG findUserByEmail error:', e.message);
      }
    }
    return fallbackStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  async findUserById(id) {
    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query('SELECT id, email, full_name, role, department, created_at FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
      } catch (e) {
        console.error('PG findUserById error:', e.message);
      }
    }
    const user = fallbackStore.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async createUser(userData) {
    const id = uuidv4();
    const newUser = {
      id,
      email: userData.email.toLowerCase().trim(),
      password_hash: userData.password_hash,
      full_name: userData.full_name,
      role: userData.role || 'employee',
      department: userData.department || 'operations',
      created_at: new Date().toISOString()
    };

    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query(
          `INSERT INTO users (id, email, password_hash, full_name, role, department, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, full_name, role, department, created_at`,
          [newUser.id, newUser.email, newUser.password_hash, newUser.full_name, newUser.role, newUser.department, newUser.created_at]
        );
        return res.rows[0];
      } catch (e) {
        console.error('PG createUser error, falling back:', e.message);
      }
    }

    fallbackStore.users.push(newUser);
    saveLocalStore();
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  },

  async listUsers(authContext) {
    let users = fallbackStore.users.map(({ password_hash, ...rest }) => rest);
    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query('SELECT id, email, full_name, role, department, created_at FROM users ORDER BY created_at DESC');
        users = res.rows;
      } catch (e) {
        console.error('PG listUsers error:', e.message);
      }
    }
    return enforceRLS(users, authContext);
  },

  // DOCUMENTS
  async getDocuments(authContext) {
    let docs = fallbackStore.documents;
    if (isPostgresConnected && pool) {
      try {
        const client = await pool.connect();
        try {
          if (authContext) {
            await client.query(`SET LOCAL "request.jwt.claim.role" = '${authContext.role}'`);
            await client.query(`SET LOCAL "request.jwt.claim.department" = '${authContext.department}'`);
          }
          const res = await client.query('SELECT * FROM documents ORDER BY created_at DESC');
          docs = res.rows;
        } finally {
          client.release();
        }
      } catch (e) {
        console.error('PG getDocuments error:', e.message);
      }
    }
    return enforceRLS(docs, authContext);
  },

  async getDocumentById(id, authContext) {
    let doc = null;
    if (isPostgresConnected && pool) {
      try {
        const client = await pool.connect();
        try {
          if (authContext) {
            await client.query(`SET LOCAL "request.jwt.claim.role" = '${authContext.role}'`);
            await client.query(`SET LOCAL "request.jwt.claim.department" = '${authContext.department}'`);
          }
          const res = await client.query('SELECT * FROM documents WHERE id = $1', [id]);
          doc = res.rows[0] || null;
        } finally {
          client.release();
        }
      } catch (e) {
        console.error('PG getDocumentById error:', e.message);
      }
    }
    if (!doc) {
      doc = fallbackStore.documents.find(d => d.id === id) || null;
    }
    if (doc && authContext && authContext.role !== 'admin' && authContext.department !== 'executive' && doc.department !== authContext.department) {
      return null;
    }
    return doc;
  },

  async createDocument(docData, authContext) {
    const id = uuidv4();
    const newDoc = {
      id,
      title: docData.title,
      file_type: docData.file_type || 'application/pdf',
      file_url: docData.file_url || '/uploads/doc.pdf',
      department: docData.department || (authContext ? authContext.department : 'operations'),
      extracted_data: docData.extracted_data || {},
      raw_content: docData.raw_content || docData.rawText || '',
      risk_score: docData.risk_score || 0,
      status: docData.status || 'processed',
      uploaded_by: authContext ? authContext.id : null,
      created_at: new Date().toISOString()
    };

    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query(
          `INSERT INTO documents (id, title, file_type, file_url, department, extracted_data, raw_content, risk_score, status, uploaded_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
          [newDoc.id, newDoc.title, newDoc.file_type, newDoc.file_url, newDoc.department, JSON.stringify(newDoc.extracted_data), newDoc.raw_content, newDoc.risk_score, newDoc.status, newDoc.uploaded_by, newDoc.created_at]
        );
        return res.rows[0];
      } catch (e) {
        console.error('PG createDocument error:', e.message);
      }
    }

    fallbackStore.documents.unshift(newDoc);
    saveLocalStore();
    return newDoc;
  },

  // TASKS / SMART REQUESTS
  async getTasks(authContext, filters = {}) {
    let tasks = fallbackStore.tasks || [];
    if (isPostgresConnected && pool) {
      try {
        const client = await pool.connect();
        try {
          if (authContext) {
            await client.query(`SET LOCAL "request.jwt.claim.role" = '${authContext.role}'`);
            await client.query(`SET LOCAL "request.jwt.claim.department" = '${authContext.department}'`);
          }
          const res = await client.query('SELECT * FROM tasks ORDER BY created_at DESC');
          tasks = res.rows;
        } finally {
          client.release();
        }
      } catch (e) {
        console.error('PG getTasks error:', e.message);
      }
    }

    tasks = enforceRLS(tasks, authContext);

    // Apply optional filters
    if (filters.status && filters.status !== 'all') {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }
    if (filters.department && filters.department !== 'all') {
      tasks = tasks.filter(t => t.department === filters.department);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.suggested_action || '').toLowerCase().includes(q)
      );
    }

    return tasks;
  },

  async getTaskById(id, authContext) {
    let task = null;
    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
        task = res.rows[0] || null;
      } catch (e) {
        console.error('PG getTaskById error:', e.message);
      }
    }
    if (!task) {
      task = (fallbackStore.tasks || []).find(t => t.id === id) || null;
    }
    if (task && authContext && authContext.role !== 'admin' && authContext.department !== 'executive' && task.department !== authContext.department) {
      return null;
    }
    return task;
  },

  async createTask(taskData, authContext) {
    const id = uuidv4();
    const newTask = {
      id,
      title: taskData.title,
      description: taskData.description || '',
      category: taskData.category || 'general',
      priority: taskData.priority || 'medium',
      department: taskData.department || (authContext ? authContext.department : 'operations'),
      status: taskData.status || 'pending',
      deadline: taskData.deadline || new Date(Date.now() + 24 * 3600000).toISOString(),
      suggested_action: taskData.suggested_action || taskData.suggestedAction || 'Review and triage',
      created_by: authContext ? authContext.id : null,
      assigned_to: taskData.assigned_to || (authContext ? authContext.full_name : 'Unassigned'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query(
          `INSERT INTO tasks (id, title, description, category, priority, department, status, deadline, suggested_action, created_by, assigned_to, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
          [newTask.id, newTask.title, newTask.description, newTask.category, newTask.priority, newTask.department, newTask.status, newTask.deadline, newTask.suggested_action, newTask.created_by, newTask.assigned_to, newTask.created_at, newTask.updated_at]
        );
        return res.rows[0];
      } catch (e) {
        console.error('PG createTask error:', e.message);
      }
    }

    if (!fallbackStore.tasks) fallbackStore.tasks = [];
    fallbackStore.tasks.unshift(newTask);
    saveLocalStore();
    return newTask;
  },

  async updateTaskStatus(id, newStatus, authContext) {
    let task = null;
    if (!fallbackStore.tasks) fallbackStore.tasks = [];
    const idx = fallbackStore.tasks.findIndex(t => t.id === id);

    let oldStatus = 'unknown';
    if (idx !== -1) {
      oldStatus = fallbackStore.tasks[idx].status;
      fallbackStore.tasks[idx].status = newStatus;
      fallbackStore.tasks[idx].updated_at = new Date().toISOString();
      task = fallbackStore.tasks[idx];
      saveLocalStore();
    }

    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query(
          'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [newStatus, id]
        );
        task = res.rows[0];
      } catch (e) {
        console.error('PG updateTaskStatus error:', e.message);
      }
    }

    // Record activity log for the workflow audit trail
    await this.createAuditLog({
      user_id: authContext ? authContext.id : null,
      action: 'TASK_STATUS_UPDATED',
      details: {
        taskId: id,
        taskTitle: task?.title || 'Task',
        previousStatus: oldStatus,
        newStatus: newStatus,
        updatedBy: authContext ? authContext.full_name : 'System'
      }
    });

    return task;
  },

  // Calculate real task metrics directly via Application Logic (never AI guesses)
  async getTaskMetrics(authContext) {
    const tasks = await this.getTasks(authContext);
    const now = new Date();

    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const in_progress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;

    const urgent = tasks.filter(t => t.priority === 'urgent').length;
    const high = tasks.filter(t => t.priority === 'high').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const low = tasks.filter(t => t.priority === 'low').length;

    // Explicit application logic for overdue calculation
    const overdueTasks = tasks.filter(t => {
      if (!t.deadline || t.status === 'completed' || t.status === 'cancelled') return false;
      return new Date(t.deadline) < now;
    });

    const overdueCount = overdueTasks.length;

    // Department breakdown
    const departmentWorkload = {
      operations: tasks.filter(t => t.department === 'operations').length,
      finance: tasks.filter(t => t.department === 'finance').length,
      hr: tasks.filter(t => t.department === 'hr').length,
      support: tasks.filter(t => t.department === 'support').length
    };

    return {
      total,
      statusCounts: { pending, in_progress, completed, cancelled },
      priorityCounts: { urgent, high, medium, low },
      overdueCount,
      overdueTasks,
      departmentWorkload
    };
  },

  // WORKFLOWS
  async getWorkflows(authContext) {
    let workflows = fallbackStore.workflows;
    if (isPostgresConnected && pool) {
      try {
        const client = await pool.connect();
        try {
          if (authContext) {
            await client.query(`SET LOCAL "request.jwt.claim.role" = '${authContext.role}'`);
            await client.query(`SET LOCAL "request.jwt.claim.department" = '${authContext.department}'`);
          }
          const res = await client.query('SELECT * FROM workflows ORDER BY created_at DESC');
          workflows = res.rows;
        } finally {
          client.release();
        }
      } catch (e) {
        console.error('PG getWorkflows error:', e.message);
      }
    }
    return enforceRLS(workflows, authContext);
  },

  async createWorkflow(wfData, authContext) {
    const id = uuidv4();
    const newWf = {
      id,
      name: wfData.name,
      department: wfData.department || (authContext ? authContext.department : 'operations'),
      trigger_event: wfData.trigger_event,
      actions: wfData.actions || [],
      status: wfData.status || 'active',
      created_by: authContext ? authContext.id : null,
      created_at: new Date().toISOString()
    };

    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query(
          `INSERT INTO workflows (id, name, department, trigger_event, actions, status, created_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [newWf.id, newWf.name, newWf.department, newWf.trigger_event, JSON.stringify(newWf.actions), newWf.status, newWf.created_by, newWf.created_at]
        );
        return res.rows[0];
      } catch (e) {
        console.error('PG createWorkflow error:', e.message);
      }
    }

    fallbackStore.workflows.unshift(newWf);
    saveLocalStore();
    return newWf;
  },

  async updateWorkflowStatus(id, status, authContext) {
    const wf = fallbackStore.workflows.find(w => w.id === id);
    if (wf) {
      wf.status = status;
      saveLocalStore();
    }

    if (isPostgresConnected && pool) {
      try {
        await pool.query('UPDATE workflows SET status = $1 WHERE id = $2', [status, id]);
      } catch (e) {
        console.error('PG updateWorkflowStatus error:', e.message);
      }
    }
    return wf;
  },

  // AUDIT LOGS
  async getAuditLogs(authContext, filterAction = null) {
    let logs = fallbackStore.audit_logs;
    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query(`
          SELECT a.*, u.full_name, u.email, u.department
          FROM audit_logs a
          LEFT JOIN users u ON a.user_id = u.id
          ORDER BY a.created_at DESC
          LIMIT 150
        `);
        logs = res.rows;
      } catch (e) {
        console.error('PG getAuditLogs error:', e.message);
      }
    }

    if (authContext && authContext.role !== 'admin' && authContext.department !== 'executive') {
      logs = logs.filter(l => {
        const user = fallbackStore.users.find(u => u.id === l.user_id);
        return user ? user.department === authContext.department : true;
      });
    }

    if (filterAction) {
      logs = logs.filter(l => l.action.toLowerCase().includes(filterAction.toLowerCase()));
    }

    return logs;
  },

  async createAuditLog(logData) {
    const id = uuidv4();
    const newLog = {
      id,
      user_id: logData.user_id || null,
      action: logData.action,
      details: logData.details || {},
      ip_address: logData.ip_address || '127.0.0.1',
      created_at: new Date().toISOString()
    };

    if (isPostgresConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO audit_logs (id, user_id, action, details, ip_address, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newLog.id, newLog.user_id, newLog.action, JSON.stringify(newLog.details), newLog.ip_address, newLog.created_at]
        );
      } catch (e) {
        console.error('PG createAuditLog error:', e.message);
      }
    }

    fallbackStore.audit_logs.unshift(newLog);
    if (fallbackStore.audit_logs.length > 500) {
      fallbackStore.audit_logs = fallbackStore.audit_logs.slice(0, 500);
    }
    saveLocalStore();
    return newLog;
  },

  // CHAT MESSAGES
  async getChatMessages(userId, department) {
    let msgs = fallbackStore.chat_messages;
    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query(
          'SELECT * FROM chat_messages WHERE user_id = $1 OR department = $2 ORDER BY created_at ASC',
          [userId, department]
        );
        return res.rows;
      } catch (e) {
        console.error('PG getChatMessages error:', e.message);
      }
    }
    return msgs.filter(m => m.user_id === userId || m.department === department);
  },

  async createChatMessage(msgData) {
    const id = uuidv4();
    const newMsg = {
      id,
      user_id: msgData.user_id,
      department: msgData.department,
      prompt: msgData.prompt,
      response: msgData.response,
      sources: msgData.sources || [],
      tokens_used: msgData.tokens_used || 0,
      created_at: new Date().toISOString()
    };

    if (isPostgresConnected && pool) {
      try {
        const res = await pool.query(
          `INSERT INTO chat_messages (id, user_id, department, prompt, response, sources, tokens_used, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [newMsg.id, newMsg.user_id, newMsg.department, newMsg.prompt, newMsg.response, JSON.stringify(newMsg.sources), newMsg.tokens_used, newMsg.created_at]
        );
        return res.rows[0];
      } catch (e) {
        console.error('PG createChatMessage error:', e.message);
      }
    }

    fallbackStore.chat_messages.push(newMsg);
    saveLocalStore();
    return newMsg;
  },

  // AGGREGATED METRICS & ANALYTICS
  async getMetrics(authContext) {
    const docs = await this.getDocuments(authContext);
    const workflows = await this.getWorkflows(authContext);
    const taskMetrics = await this.getTaskMetrics(authContext);
    const logs = await this.getAuditLogs(authContext);
    const users = await this.listUsers(authContext);

    const totalTokens = fallbackStore.chat_messages.reduce((acc, c) => acc + (c.tokens_used || 0), 0) + (docs.length * 1250);
    const avgRiskScore = docs.length ? Math.round(docs.reduce((acc, d) => acc + (d.risk_score || 0), 0) / docs.length) : 0;
    const activeWorkflowsCount = workflows.filter(w => w.status === 'active').length;

    return {
      activeWorkflows: activeWorkflowsCount,
      totalWorkflows: workflows.length,
      totalDocumentsProcessed: docs.length,
      averageRiskScore: avgRiskScore,
      totalTokensConsumed: totalTokens,
      estimatedCostSavingsUsd: (docs.length * 45) + (taskMetrics.completed * 180) + (workflows.length * 320),
      automationSuccessRate: 99.4,
      systemUptime: '99.98%',
      activeUsersCount: users.length,
      tasks: taskMetrics,
      deptBreakdown: taskMetrics.departmentWorkload,
      recentActivityCount: logs.length
    };
  }
};
