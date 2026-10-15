-- NexusAI Enterprise AI Database Schema with Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department department_type NOT NULL DEFAULT 'operations',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    department department_type NOT NULL,
    extracted_data JSONB,
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'processed',
    raw_content TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    department department_type NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    actions JSONB NOT NULL,
    status workflow_status DEFAULT 'active',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    priority task_priority NOT NULL DEFAULT 'medium',
    department department_type NOT NULL DEFAULT 'operations',
    status task_status NOT NULL DEFAULT 'pending',
    deadline TIMESTAMP WITH TIME ZONE,
    suggested_action TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(150) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department department_type NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    sources JSONB,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_documents_dept ON documents(department);
CREATE INDEX IF NOT EXISTS idx_tasks_dept ON tasks(department);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);

-- Row Level Security (RLS) Enablement
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Document Isolation Policy
DROP POLICY IF EXISTS document_isolation_policy ON documents;
CREATE POLICY document_isolation_policy ON documents
    FOR ALL
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin' 
        OR department::text = current_setting('request.jwt.claim.department', true)
    );

-- Workflow Isolation Policy
DROP POLICY IF EXISTS workflow_isolation_policy ON workflows;
CREATE POLICY workflow_isolation_policy ON workflows
    FOR ALL
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin' 
        OR department::text = current_setting('request.jwt.claim.department', true)
    );

-- Task Isolation Policy
DROP POLICY IF EXISTS task_isolation_policy ON tasks;
CREATE POLICY task_isolation_policy ON tasks
    FOR ALL
    USING (
        current_setting('request.jwt.claim.role', true) = 'admin' 
        OR department::text = current_setting('request.jwt.claim.department', true)
    );
