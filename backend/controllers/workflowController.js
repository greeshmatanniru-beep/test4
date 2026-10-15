import { db } from '../config/db.js';
import { workflowSchema } from '../validators/validators.js';

export async function getWorkflows(req, res) {
  try {
    const workflows = await db.getWorkflows(req.user);
    return res.json({ workflows });
  } catch (err) {
    console.error('Fetch workflows error:', err);
    return res.status(500).json({ error: 'Failed to retrieve workflows under RLS.' });
  }
}

export async function createWorkflow(req, res) {
  try {
    const parseResult = workflowSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(e => e.message)
      });
    }

    const { name, department, triggerEvent, actions } = parseResult.data;

    // Enforce role permission
    if (req.user.role === 'employee' && req.user.department !== 'executive') {
      return res.status(403).json({ error: 'Only Managers and Admins can create new automated workflows.' });
    }

    const newWf = await db.createWorkflow({
      name,
      department,
      trigger_event: triggerEvent,
      actions,
      status: 'active'
    }, req.user);

    await db.createAuditLog({
      user_id: req.user.id,
      action: 'WORKFLOW_CREATED',
      details: { workflowId: newWf.id, name: newWf.name, department: newWf.department },
      ip_address: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      message: 'Workflow automation rule registered successfully.',
      workflow: newWf
    });
  } catch (err) {
    console.error('Create workflow error:', err);
    return res.status(500).json({ error: 'Failed to create workflow.' });
  }
}

export async function toggleWorkflowStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'paused'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active or paused.' });
    }

    const updated = await db.updateWorkflowStatus(id, status, req.user);

    await db.createAuditLog({
      user_id: req.user.id,
      action: 'WORKFLOW_STATUS_TOGGLED',
      details: { workflowId: id, newStatus: status },
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({ message: `Workflow status updated to ${status}`, workflow: updated });
  } catch (err) {
    console.error('Toggle workflow status error:', err);
    return res.status(500).json({ error: 'Failed to update workflow status.' });
  }
}

export async function triggerWorkflow(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const workflows = await db.getWorkflows(req.user);
    const wf = workflows.find(w => w.id === id);

    if (!wf) {
      return res.status(404).json({ error: 'Workflow not found or unauthorized.' });
    }

    if (wf.status !== 'active') {
      return res.status(400).json({ error: 'Workflow is paused and cannot execute.' });
    }

    // Execute simulated steps
    const executionTrace = (wf.actions || []).map((action, idx) => {
      return {
        step: idx + 1,
        actionType: action.type || 'generic_action',
        status: 'SUCCESS',
        executedAt: new Date().toISOString(),
        details: `Dispatched action "${action.type || 'step'}" to target department [${wf.department.toUpperCase()}].`
      };
    });

    await db.createAuditLog({
      user_id: req.user.id,
      action: 'WORKFLOW_MANUAL_TRIGGER',
      details: { workflowId: wf.id, name: wf.name, executionTrace },
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      message: `Workflow "${wf.name}" triggered and executed successfully.`,
      executionId: `exec-${Date.now()}`,
      status: 'completed',
      stepsExecuted: executionTrace.length,
      trace: executionTrace
    });
  } catch (err) {
    console.error('Trigger workflow error:', err);
    return res.status(500).json({ error: 'Workflow execution failed.' });
  }
}
