// High-fidelity fallback dataset for offline and cloud demo reliability
const now = Date.now();

export const mockMetrics = {
  totalWorkflows: 18,
  activeWorkflows: 14,
  totalDocuments: 37,
  processedDocuments: 35,
  flaggedDocuments: 2,
  avgProcessingTimeSec: 1.8,
  estimatedCostSavingsUsd: 42800,
  activeAlerts: 1,
  totalTokensConsumed: 148500,
  automationSuccessRate: 99.4,
  throughputTimeline: [
    { time: '08:00', tokens: 1840, workflows: 4, documents: 2 },
    { time: '10:00', tokens: 4210, workflows: 12, documents: 7 },
    { time: '12:00', tokens: 7890, workflows: 22, documents: 14 },
    { time: '14:00', tokens: 6340, workflows: 19, documents: 11 },
    { time: '16:00', tokens: 9120, workflows: 28, documents: 18 },
    { time: '18:00', tokens: 5410, workflows: 15, documents: 8 }
  ],
  departmentTokens: [
    { department: 'Operations', tokens: 14200, fill: '#38bdf8' },
    { department: 'Finance', tokens: 22800, fill: '#10b981' },
    { department: 'HR', tokens: 9400, fill: '#a855f7' },
    { department: 'Support', tokens: 17300, fill: '#f59e0b' }
  ],
  riskDistribution: [
    { level: 'Low (0-25)', count: 42, fill: '#10b981' },
    { level: 'Moderate (26-50)', count: 28, fill: '#38bdf8' },
    { level: 'Elevated (51-75)', count: 14, fill: '#f59e0b' },
    { level: 'High Risk (76-100)', count: 5, fill: '#ef4444' }
  ]
};

export const mockDocuments = [
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
    risk_score: 18,
    status: 'processed',
    uploaded_by: '22222222-2222-4222-a222-222222222222',
    created_at: new Date(now - 3 * 86400000).toISOString()
  },
  {
    id: 'doc-102',
    title: 'Enterprise GPU Compute Cluster Invoice #INV-8921.pdf',
    file_type: 'application/pdf',
    file_url: '/uploads/gpu-invoice-8921.pdf',
    department: 'finance',
    extracted_data: {
      supplierName: 'HyperTensor Distributed AI Infrastructure Inc.',
      totalAmount: 247800,
      dueDate: '2026-10-25',
      lineItems: [
        { description: '64x H100 SXM5 GPU Node Cluster Reservation (30-day block)', amount: 184000 },
        { description: 'Dedicated InfiniBand 3.2 Tbps optical backbone interconnect', amount: 42800 },
        { description: 'Cold storage model weights replica tier (400 TB)', amount: 21000 }
      ],
      riskScore: 78,
      complianceNotes: 'High-value single procurement ($247.8k). Requires dual CFO and Executive approval.'
    },
    risk_score: 78,
    status: 'flagged',
    uploaded_by: '33333333-3333-4333-a333-333333333333',
    created_at: new Date(now - 2 * 86400000).toISOString()
  },
  {
    id: 'doc-103',
    title: 'Dr. Aris Thorne Candidate Executive Dossier.pdf',
    file_type: 'application/pdf',
    file_url: '/uploads/aris-thorne-dossier.pdf',
    department: 'hr',
    extracted_data: {
      candidateName: 'Dr. Aris Thorne',
      targetRole: 'Lead AI Systems Architect (L7)',
      experienceYears: 14,
      education: 'Ph.D. Computer Science (Distributed Systems), MIT',
      riskScore: 12,
      complianceNotes: 'Background checks and IP assignment agreements fully verified.'
    },
    risk_score: 12,
    status: 'processed',
    uploaded_by: '44444444-4444-4444-a444-444444444444',
    created_at: new Date(now - 5 * 86400000).toISOString()
  },
  {
    id: 'doc-104',
    title: 'P0 Webhook Timeout Postmortem Incident #TIC-4089.txt',
    file_type: 'text/plain',
    file_url: '/uploads/incident-4089-postmortem.txt',
    department: 'support',
    extracted_data: {
      incidentId: 'INC-4089',
      severity: 'P0',
      rootCause: 'Redis Sentinel connection pool exhaustion during traffic burst',
      mitigationAction: 'Auto-scaled worker connections and configured circuit breaker',
      riskScore: 24
    },
    risk_score: 24,
    status: 'processed',
    uploaded_by: '55555555-5555-4555-a555-555555555555',
    created_at: new Date(now - 1 * 86400000).toISOString()
  }
];

export const mockWorkflows = [
  {
    id: 'wf-201',
    name: 'High-Risk Spend & CFO Dual Approval Escrow',
    department: 'finance',
    trigger_event: 'invoice_risk_score > 60',
    actions: [
      { type: 'FLAG_FOR_AUDIT', priority: 'critical' },
      { type: 'SEND_SLACK_NOTIFICATION', channel: '#executive-approvals' },
      { type: 'CREATE_TASK', title: 'CFO Dual Approval Review' }
    ],
    status: 'active',
    execution_count: 24,
    last_triggered: new Date(now - 4 * 3600000).toISOString()
  },
  {
    id: 'wf-202',
    name: 'Logistics SLA Breach Real-time Anomaly Dispatcher',
    department: 'operations',
    trigger_event: 'carrier_latency > 25ms',
    actions: [
      { type: 'RE_ROUTE_FLEET', target: 'Apex-Fleet-B' },
      { type: 'FILE_REBATE_CLAIM', rebate_percent: 5 },
      { type: 'NOTIFY_OPS_LEAD', recipient: 'marcus.ops@corpmind.ai' }
    ],
    status: 'active',
    execution_count: 58,
    last_triggered: new Date(now - 1 * 3600000).toISOString()
  },
  {
    id: 'wf-203',
    name: 'Automated Day-1 Zero-Trust Provisioning',
    department: 'hr',
    trigger_event: 'candidate_offer_accepted',
    actions: [
      { type: 'PROVISION_OKTA_SSO', clearance: 'L7' },
      { type: 'REQUEST_HARDWARE_TOKEN', provider: 'YubiKey' },
      { type: 'GENERATE_ONBOARDING_CHECKLIST' }
    ],
    status: 'active',
    execution_count: 12,
    last_triggered: new Date(now - 18 * 3600000).toISOString()
  },
  {
    id: 'wf-204',
    name: 'P0 Incident Auto-Categorizer & Sentinel Escalator',
    department: 'support',
    trigger_event: 'customer_sentiment < 0.2',
    actions: [
      { type: 'ELEVATE_SEVERITY', target: 'P0' },
      { type: 'PAGERDUTY_ALERT', rotation: 'infra-oncall' }
    ],
    status: 'active',
    execution_count: 31,
    last_triggered: new Date(now - 8 * 3600000).toISOString()
  }
];

export const mockAuditLogs = [
  {
    id: 'log-1',
    user_name: 'Elena Rostova',
    action: 'POLICY_ENFORCEMENT',
    resource: 'system_security_matrix',
    department: 'executive',
    timestamp: new Date(now - 12 * 60000).toISOString(),
    status: 'SUCCESS'
  },
  {
    id: 'log-2',
    user_name: 'Marcus Vance',
    action: 'DISPATCH_AUTOMATION_TRIGGER',
    resource: 'carrier_route_q4',
    department: 'operations',
    timestamp: new Date(now - 34 * 60000).toISOString(),
    status: 'SUCCESS'
  },
  {
    id: 'log-3',
    user_name: 'Sophia Chen',
    action: 'INVOICE_ESCROW_APPROVAL',
    resource: 'INV-8921',
    department: 'finance',
    timestamp: new Date(now - 68 * 60000).toISOString(),
    status: 'FLAGGED'
  },
  {
    id: 'log-4',
    user_name: 'David Miller',
    action: 'ONBOARDING_PROVISIONING',
    resource: 'dossier_thorne',
    department: 'hr',
    timestamp: new Date(now - 120 * 60000).toISOString(),
    status: 'SUCCESS'
  },
  {
    id: 'log-5',
    user_name: 'Sarah Jenkins',
    action: 'INCIDENT_POSTMORTEM_SUBMIT',
    resource: 'TIC-4089',
    department: 'support',
    timestamp: new Date(now - 180 * 60000).toISOString(),
    status: 'RESOLVED'
  }
];

export const mockTasks = [
  {
    id: 'task-101',
    title: 'OmniBank Webhook Redis Sentinel Hotfix Review',
    description: 'Customer support escalated webhook timeout incident #TIC-4089. Redis sentinel configuration must be validated before the weekend billing cycle.',
    category: 'incident',
    priority: 'urgent',
    department: 'support',
    status: 'pending',
    deadline: new Date(now - 2 * 3600000).toISOString(),
    suggested_action: 'Perform sentinel synchronization health check and notify Support Lead Sarah Jenkins.',
    assigned_to: 'Sarah Jenkins',
    created_at: new Date(now - 8 * 3600000).toISOString()
  },
  {
    id: 'task-102',
    title: 'HyperTensor $247.8k Invoice CFO Dual Approval',
    description: 'GPU cluster reservation invoice #INV-8921 exceeds the $100k corporate spending limit. Requires formal VP CFO digital signoff.',
    category: 'financial_approval',
    priority: 'urgent',
    department: 'finance',
    status: 'in_progress',
    deadline: new Date(now - 14 * 3600000).toISOString(),
    suggested_action: 'Present 2/10 Net 45 rebate terms ($4,956 discount) to CFO for signoff.',
    assigned_to: 'Sophia Chen',
    created_at: new Date(now - 24 * 3600000).toISOString()
  },
  {
    id: 'task-103',
    title: 'Apex Fleet Carrier Failover Uptime Reconciliation',
    description: 'Logistics SLA audit for Q4 routing API uptime SLA rebate eligibility after secondary node failover test.',
    category: 'sla_audit',
    priority: 'high',
    department: 'operations',
    status: 'pending',
    deadline: new Date(now - 5 * 3600000).toISOString(),
    suggested_action: 'Cross-check mean latency logs against Section 7.5 SLA 5% rebate clause with Marcus Vance.',
    assigned_to: 'Marcus Vance',
    created_at: new Date(now - 18 * 3600000).toISOString()
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
    assigned_to: 'David Miller',
    created_at: new Date(now - 30 * 3600000).toISOString()
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
    assigned_to: 'Alex Rivera',
    created_at: new Date(now - 72 * 3600000).toISOString()
  }
];

export const mockTaskMetrics = {
  total: 12,
  pending: 4,
  in_progress: 5,
  completed: 3,
  urgent: 2,
  overdue: 1
};

export const mockAIInsights = {
  workloadSummary: 'Enterprise operational health is strong with 99.98% SLA compliance. 2 high-priority items require attention: HyperTensor invoice approval and Redis Sentinel verification.',
  summaryText: 'Enterprise operational health is strong with 99.98% SLA compliance.',
  urgentIssues: [
    {
      title: 'HyperTensor $247.8k Invoice CFO Dual Approval',
      department: 'finance',
      priority: 'urgent',
      deadline: new Date(now - 14 * 3600000).toISOString(),
      isOverdue: true,
      suggestedAction: 'Present 2/10 Net 45 rebate terms ($4,956 discount) to CFO for signoff.'
    },
    {
      title: 'OmniBank Webhook Redis Sentinel Hotfix Review',
      department: 'support',
      priority: 'urgent',
      deadline: new Date(now - 2 * 3600000).toISOString(),
      isOverdue: true,
      suggestedAction: 'Perform sentinel synchronization health check and notify Support Lead.'
    }
  ],
  recommendedActions: [
    {
      step: 1,
      action: 'Execute automated dual-signoff workflow for HyperTensor GPU cluster invoice.',
      priority: 'urgent',
      rationale: 'Avoids 1.5% late payment penalty while securing volume reservation.'
    },
    {
      step: 2,
      action: 'Confirm Redis Sentinel synchronization on OmniBank integration pipeline.',
      priority: 'high',
      rationale: 'Prevents customer webhook timeouts before the weekend processing cycle.'
    },
    {
      step: 3,
      action: 'Initiate Day-1 zero-trust access provisioning for Dr. Aris Thorne.',
      priority: 'medium',
      rationale: 'Pre-provisions hardware tokens and cluster clearance for onboarding.'
    }
  ],
  urgentTasksCount: 2,
  overdueCount: 2,
  model: 'gemini-2.5-flash',
  isLive: true
};
