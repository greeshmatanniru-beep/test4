-- =============================================================================
-- NexusAI Enterprise AI - Complete Supabase Single-Run Migration
-- =============================================================================
-- Description: Creates all database schemas, enums, tables, indexes, RLS policies,
--              triggers, and seed data in a single idempotent run.
-- Safe to execute repeatedly in Supabase SQL Editor.
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE department_type AS ENUM ('operations', 'finance', 'hr', 'support', 'executive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE workflow_status AS ENUM ('active', 'paused', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES DEFINITION

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department department_type NOT NULL DEFAULT 'operations',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents & Invoices table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    department department_type NOT NULL,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'processed',
    raw_content TEXT,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automated Workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    department department_type NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status workflow_status DEFAULT 'active',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Smart Requests & Structured Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    priority task_priority NOT NULL DEFAULT 'medium',
    department department_type NOT NULL DEFAULT 'operations',
    status task_status NOT NULL DEFAULT 'pending',
    deadline TIMESTAMP WITH TIME ZONE,
    suggested_action TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_to VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enterprise Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(150) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grounded Knowledge Assistant Chat History table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department department_type NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_documents_dept ON public.documents(department);
CREATE INDEX IF NOT EXISTS idx_workflows_dept ON public.workflows(department);
CREATE INDEX IF NOT EXISTS idx_tasks_dept ON public.tasks(department);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_dept ON public.chat_messages(user_id, department);

-- 5. AUTOMATED TIMESTAMP UPDATE TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

-- 6. ROW LEVEL SECURITY (RLS) ENABLEMENT
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES (Compatible with Supabase Auth, Service Role, & Node.js API claims)

-- Users Policies
DROP POLICY IF EXISTS users_isolation_policy ON public.users;
CREATE POLICY users_isolation_policy ON public.users
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR coalesce(current_setting('request.jwt.claim.role', true), auth.jwt() ->> 'role') = 'admin'
        OR department::text = coalesce(current_setting('request.jwt.claim.department', true), auth.jwt() ->> 'department')
        OR id::text = coalesce(current_setting('request.jwt.claim.sub', true), auth.uid()::text)
    );

-- Documents Policies
DROP POLICY IF EXISTS document_isolation_policy ON public.documents;
CREATE POLICY document_isolation_policy ON public.documents
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR coalesce(current_setting('request.jwt.claim.role', true), auth.jwt() ->> 'role') = 'admin'
        OR department::text = coalesce(current_setting('request.jwt.claim.department', true), auth.jwt() ->> 'department')
    );

-- Workflows Policies
DROP POLICY IF EXISTS workflow_isolation_policy ON public.workflows;
CREATE POLICY workflow_isolation_policy ON public.workflows
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR coalesce(current_setting('request.jwt.claim.role', true), auth.jwt() ->> 'role') = 'admin'
        OR department::text = coalesce(current_setting('request.jwt.claim.department', true), auth.jwt() ->> 'department')
    );

-- Tasks Policies
DROP POLICY IF EXISTS task_isolation_policy ON public.tasks;
CREATE POLICY task_isolation_policy ON public.tasks
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR coalesce(current_setting('request.jwt.claim.role', true), auth.jwt() ->> 'role') = 'admin'
        OR department::text = coalesce(current_setting('request.jwt.claim.department', true), auth.jwt() ->> 'department')
    );

-- Audit Logs Policies
DROP POLICY IF EXISTS audit_logs_isolation_policy ON public.audit_logs;
CREATE POLICY audit_logs_isolation_policy ON public.audit_logs
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR coalesce(current_setting('request.jwt.claim.role', true), auth.jwt() ->> 'role') = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = audit_logs.user_id 
            AND u.department::text = coalesce(current_setting('request.jwt.claim.department', true), auth.jwt() ->> 'department')
        )
    );

-- Chat Messages Policies
DROP POLICY IF EXISTS chat_messages_isolation_policy ON public.chat_messages;
CREATE POLICY chat_messages_isolation_policy ON public.chat_messages
    FOR ALL
    USING (
        auth.role() = 'service_role'
        OR coalesce(current_setting('request.jwt.claim.role', true), auth.jwt() ->> 'role') = 'admin'
        OR user_id::text = coalesce(current_setting('request.jwt.claim.sub', true), auth.uid()::text)
        OR department::text = coalesce(current_setting('request.jwt.claim.department', true), auth.jwt() ->> 'department')
    );

-- 8. INITIAL SEED DATA (Password for all seed users is 'password123')

-- Insert Seed Users
INSERT INTO public.users (id, email, password_hash, full_name, role, department)
VALUES
    ('11111111-1111-4111-a111-111111111111', 'admin@corpmind.ai', '$2a$12$RT5npJiRMZVIKkLo6ADS5.rnw1Dlqg77mYwJvOvQSmFrNXy8J.01i', 'Elena Rostova (Chief AI & Operations Officer)', 'admin', 'executive'),
    ('22222222-2222-4222-a222-222222222222', 'marcus.ops@corpmind.ai', '$2a$12$RT5npJiRMZVIKkLo6ADS5.rnw1Dlqg77mYwJvOvQSmFrNXy8J.01i', 'Marcus Vance (VP Operations)', 'manager', 'operations'),
    ('33333333-3333-4333-a333-333333333333', 'sophia.fin@corpmind.ai', '$2a$12$RT5npJiRMZVIKkLo6ADS5.rnw1Dlqg77mYwJvOvQSmFrNXy8J.01i', 'Sophia Chen (Finance Director)', 'manager', 'finance'),
    ('44444444-4444-4444-a444-444444444444', 'david.hr@corpmind.ai', '$2a$12$RT5npJiRMZVIKkLo6ADS5.rnw1Dlqg77mYwJvOvQSmFrNXy8J.01i', 'David Miller (People Ops Lead)', 'manager', 'hr'),
    ('55555555-5555-4555-a555-555555555555', 'sarah.sup@corpmind.ai', '$2a$12$RT5npJiRMZVIKkLo6ADS5.rnw1Dlqg77mYwJvOvQSmFrNXy8J.01i', 'Sarah Jenkins (Customer Success Lead)', 'manager', 'support'),
    ('66666666-6666-4666-a666-666666666666', 'alex.emp@corpmind.ai', '$2a$12$RT5npJiRMZVIKkLo6ADS5.rnw1Dlqg77mYwJvOvQSmFrNXy8J.01i', 'Alex Rivera (Operations Analyst)', 'employee', 'operations')
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    full_name = EXCLUDED.full_name;

-- Insert Seed Documents (with raw content for genuine AI source extraction)
INSERT INTO public.documents (id, title, file_type, file_url, department, extracted_data, risk_score, status, raw_content, uploaded_by)
VALUES
    (
        'doc-10111111-1111-4111-a111-111111111111',
        'Global Logistics Cloud SLA Contract Q4.pdf',
        'application/pdf',
        '/uploads/sample-logistics-sla.pdf',
        'operations',
        '{"supplierName": "Apex Fleet & Logistics Cloud Corp", "totalAmount": 148500, "dueDate": "2026-11-30", "complianceNotes": "SLA guarantees sub-15ms route compute; penalty clause adheres to ISO-27001 standard."}'::jsonb,
        18,
        'processed',
        'GLOBAL LOGISTICS CLOUD SLA CONTRACT (Q4)
Supplier: Apex Fleet & Logistics Cloud Corp
Client: NexusAI Operations Hub
Section 3.1 Availability Standard:
Apex guarantees 99.99% uptime for all freight routing and automated container dispatch APIs across North American and European fulfillment hubs.
Section 4.2 Latency Guarantee:
Mean transit telemetry API compute latency shall not exceed 15 milliseconds under peak dispatch volumes.
Section 7.5 Breach Penalties:
Unplanned service disruptions exceeding 0.01% in any calendar month entitle Client to an automatic 5% billing rebate per 30 minutes of downtime, capped at 35% of monthly fees.
Section 9.1 Failover & Disaster Recovery:
In the event of primary carrier cluster failure, traffic must fail over automatically to Apex-Fleet-B secondary node within 45 seconds.',
        '22222222-2222-4222-a222-222222222222'
    ),
    (
        'doc-10222222-2222-4222-a222-222222222222',
        'Enterprise GPU Compute Cluster Invoice #INV-8921.pdf',
        'application/pdf',
        '/uploads/gpu-invoice-8921.pdf',
        'finance',
        '{"supplierName": "HyperTensor Distributed Systems Inc.", "totalAmount": 247800, "dueDate": "2026-12-15", "complianceNotes": "High liability threshold. Invoice amount exceeds $100k threshold requiring dual VP CFO authorization."}'::jsonb,
        72,
        'processed',
        'INVOICE #INV-8921
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
Corporate Governance Note: Invoices exceeding $100,000 require dual approval from VP Finance and Executive Director.',
        '33333333-3333-4333-a333-333333333333'
    ),
    (
        'doc-10333333-3333-4333-a333-333333333333',
        'Senior AI Research Engineer Candidate Dossier.pdf',
        'application/pdf',
        '/uploads/resume-lead-ai.pdf',
        'hr',
        '{"supplierName": "Dr. Aris Thorne", "totalAmount": 0, "dueDate": "2026-11-01", "complianceNotes": "Full compliance with equal opportunity and NDA screening. Offer recommendation approved."}'::jsonb,
        8,
        'processed',
        'CANDIDATE DOSSIER & VERIFICATION REPORT
Candidate Name: Dr. Aris Thorne
Target Position: Lead AI Systems Architect
Department: Human Resources / Engineering Staff
Verification Summary:
- Background Check: Clear (Checkr Enterprise Level 3 verification completed Oct 2026).
- Technical Evaluation: 8+ years leading large-scale Transformer distributed training. Author of 4 awarded patents on asynchronous multi-agent consensus.
- Regulatory Compliance: EEO compliant, Non-Compete review completed with previous employer without encumbrances.
- Recommended Offer Package: Base Salary $245,000 + Equity Options. Onboarding target date: November 01, 2026.',
        '44444444-4444-4444-a444-444444444444'
    ),
    (
        'doc-10444444-4444-4444-a444-444444444444',
        'Tier-1 Customer Escalation & Incident Report #TIC-4089.txt',
        'text/plain',
        '/uploads/incident-4089.txt',
        'support',
        '{"supplierName": "OmniBank Financial Services", "totalAmount": 0, "dueDate": "2026-10-20", "complianceNotes": "Tier 1 SLA breach mitigated within credit tolerance window. Engineering patch v4.9.2 deployed."}'::jsonb,
        45,
        'processed',
        'INCIDENT POSTMORTEM REPORT #TIC-4089
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
3. SLA credit authorization of $12,500 issued within contractual penalty limit.',
        '55555555-5555-4555-a555-555555555555'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Workflows
INSERT INTO public.workflows (id, name, department, trigger_event, actions, status, created_by)
VALUES
    (
        'wf-20111111-1111-4111-a111-111111111111',
        'High-Value Invoice Threshold Escalation',
        'finance',
        'invoice_amount_exceeds_threshold',
        '[{"type": "ai_risk_assessment", "model": "gemini-2.5-pro", "threshold": 10000}, {"role": "manager", "type": "require_approval", "department": "finance"}, {"channel": "finance-director-slack", "type": "dispatch_alert"}]'::jsonb,
        'active',
        '33333333-3333-4333-a333-333333333333'
    ),
    (
        'wf-20222222-2222-4222-a222-222222222222',
        'Operations Route SLA Anomaly Guard',
        'operations',
        'sla_breach_detected',
        '[{"target": "supply-chain", "type": "ai_telemetry_diagnostic"}, {"type": "reroute_traffic", "failover_carrier": "Apex-Fleet-B"}, {"type": "notify_operations_commander"}]'::jsonb,
        'active',
        '22222222-2222-4222-a222-222222222222'
    ),
    (
        'wf-20333333-3333-4333-a333-333333333333',
        'Automated HR Onboarding Provisioning',
        'hr',
        'candidate_offer_accepted',
        '[{"model": "gemini-2.5-flash", "type": "generate_custom_welcome_pack"}, {"scope": "engineering", "type": "provision_corporate_sso"}, {"day_offset": 1, "type": "schedule_manager_sync"}]'::jsonb,
        'active',
        '44444444-4444-4444-a444-444444444444'
    ),
    (
        'wf-20444444-4444-4444-a444-444444444444',
        'Critical Incident Triage & Sentiment Escalation',
        'support',
        'negative_sentiment_score_spike',
        '[{"type": "ai_sentiment_audit", "min_confidence": 0.85}, {"type": "escalate_ticket", "priority": "P0-Urgent"}, {"type": "generate_executive_postmortem_draft"}]'::jsonb,
        'active',
        '55555555-5555-4555-a555-555555555555'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Tasks (including realistic overdue deadlines for Live Dashboard calculation)
INSERT INTO public.tasks (id, title, description, category, priority, department, status, deadline, suggested_action, created_by, assigned_to)
VALUES
    (
        'task-10111111-1111-4111-a111-111111111111',
        'OmniBank Webhook Redis Sentinel Hotfix Review',
        'Customer support escalated webhook timeout incident #TIC-4089. Redis sentinel configuration must be validated before the weekend billing cycle.',
        'incident',
        'urgent',
        'support',
        'pending',
        CURRENT_TIMESTAMP - INTERVAL '2 hours', -- Overdue
        'Perform sentinel synchronization health check and notify Support Lead Sarah Jenkins.',
        '55555555-5555-4555-a555-555555555555',
        'Sarah Jenkins'
    ),
    (
        'task-10222222-2222-4222-a222-222222222222',
        'HyperTensor $247.8k Invoice CFO Dual Approval',
        'GPU cluster reservation invoice #INV-8921 exceeds the $100k corporate spending limit. Requires formal VP CFO digital signoff.',
        'financial_approval',
        'urgent',
        'finance',
        'in_progress',
        CURRENT_TIMESTAMP - INTERVAL '14 hours', -- Overdue
        'Present 2/10 Net 45 rebate terms ($4,956 discount) to CFO for signoff.',
        '33333333-3333-4333-a333-333333333333',
        'Sophia Chen'
    ),
    (
        'task-10333333-3333-4333-a333-333333333333',
        'Apex Fleet Carrier Failover Uptime Reconciliation',
        'Logistics SLA audit for Q4 routing API uptime SLA rebate eligibility after secondary node failover test.',
        'sla_audit',
        'high',
        'operations',
        'pending',
        CURRENT_TIMESTAMP - INTERVAL '5 hours', -- Overdue
        'Cross-check mean latency logs against Section 7.5 SLA 5% rebate clause with Marcus Vance.',
        '22222222-2222-4222-a222-222222222222',
        'Marcus Vance'
    ),
    (
        'task-10444444-4444-4444-a444-444444444444',
        'Dr. Aris Thorne Onboarding Security Clearance',
        'Provision corporate SSO, Zero-Trust hardware tokens, and GPU cluster access for newly hired Lead AI Systems Architect.',
        'onboarding',
        'medium',
        'hr',
        'in_progress',
        CURRENT_TIMESTAMP + INTERVAL '48 hours', -- Upcoming
        'Coordinate with IT infrastructure for Day-1 enterprise provisioning pack.',
        '44444444-4444-4444-a444-444444444444',
        'David Miller'
    ),
    (
        'task-10555555-5555-4555-a555-555555555555',
        'Automated Carrier Failover Dry-Run Verification',
        'Simulate disaster recovery failover to Apex-Fleet-B secondary node to ensure zero container routing dropped.',
        'maintenance',
        'low',
        'operations',
        'completed',
        CURRENT_TIMESTAMP - INTERVAL '36 hours',
        'Export failover latency log to executive operations binder.',
        '22222222-2222-4222-a222-222222222222',
        'Alex Rivera'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Audit Logs
INSERT INTO public.audit_logs (id, user_id, action, details, ip_address)
VALUES
    ('log-00111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'SYSTEM_INITIALIZED', '{"platform": "NexusAI Enterprise AI", "rls_enabled": true, "environment": "production"}'::jsonb, '10.0.4.12'),
    ('log-00222222-2222-4222-a222-222222222222', '33333333-3333-4333-a333-333333333333', 'DOCUMENT_ANALYZED', '{"docId": "doc-10222222-2222-4222-a222-222222222222", "riskScore": 72, "supplier": "HyperTensor Distributed Systems Inc."}'::jsonb, '10.0.4.55'),
    ('log-00333333-3333-4333-a333-333333333333', '55555555-5555-4555-a555-555555555555', 'TASK_STATUS_UPDATED', '{"to": "in_progress", "from": "pending", "taskId": "task-10111111-1111-4111-a111-111111111111"}'::jsonb, '10.0.4.89')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Grounded Chat Message with Genuine Sources
INSERT INTO public.chat_messages (id, user_id, department, prompt, response, sources, tokens_used)
VALUES
    (
        'chat-00111111-1111-4111-a111-111111111111',
        '22222222-2222-4222-a222-222222222222',
        'operations',
        'What are the main SLA liabilities in our Apex Fleet Cloud contract?',
        'Based on the **Global Logistics Cloud SLA Contract Q4**, Apex guarantees a **99.99% route compute uptime** with sub-15ms compute latency. SLA penalty provisions include a 5% billing rebate for every 30 minutes of unplanned outage exceeding 0.01% per calendar month.',
        '[{"section": "Section 3.1 & 7.5", "confidence": "High (0.96)", "documentId": "doc-10111111-1111-4111-a111-111111111111", "excerpt": "Apex guarantees 99.99% uptime for all freight routing and automated container dispatch APIs... Unplanned service disruptions exceeding 0.01% in any calendar month entitle Client to an automatic 5% billing rebate per 30 minutes of downtime.", "documentTitle": "Global Logistics Cloud SLA Contract Q4.pdf"}]'::jsonb,
        342
    )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Migration Complete! All tables, RLS policies, and enterprise seed data created.
-- =============================================================================
