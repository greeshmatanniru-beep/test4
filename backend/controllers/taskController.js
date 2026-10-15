import { db } from '../config/db.js';
import { parseSmartRequest } from '../services/gemini.js';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  category: z.string().default('general'),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).default('medium'),
  department: z.enum(['operations', 'finance', 'hr', 'support', 'executive']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  deadline: z.string().optional(),
  suggestedAction: z.string().optional()
});

export async function parseRequest(req, res) {
  try {
    const requestText = req.body.requestText || req.body.prompt;
    const department = req.body.department;
    if (!requestText || requestText.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a clear natural language request to convert into a task.' });
    }

    const defaultDept = department || req.user.department || 'operations';
    const result = await parseSmartRequest(requestText, defaultDept);

    return res.json({
      message: 'Request analyzed and converted into structured task proposal. Please review before saving.',
      proposal: result.taskProposal,
      task: result.taskProposal,
      model: result.model,
      isLive: result.isLive
    });
  } catch (err) {
    console.error('Parse smart request error:', err);
    return res.status(500).json({ error: 'Failed to parse natural language request into task.' });
  }
}

export async function getTasks(req, res) {
  try {
    const filters = {
      status: req.query.status || 'all',
      priority: req.query.priority || 'all',
      department: req.query.department || 'all',
      search: req.query.search || ''
    };

    const tasks = await db.getTasks(req.user, filters);
    return res.json({ tasks });
  } catch (err) {
    console.error('Fetch tasks error:', err);
    return res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
}

export async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    const task = await db.getTaskById(id, req.user);
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }
    return res.json({ task });
  } catch (err) {
    console.error('Get task error:', err);
    return res.status(500).json({ error: 'Failed to fetch task.' });
  }
}

export async function createTask(req, res) {
  try {
    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(e => e.message)
      });
    }

    const data = parseResult.data;
    const newTask = await db.createTask({
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      department: data.department,
      status: data.status,
      deadline: data.deadline,
      suggested_action: data.suggestedAction || req.body.suggested_action
    }, req.user);

    await db.createAuditLog({
      user_id: req.user.id,
      action: 'TASK_CREATED',
      details: {
        taskId: newTask.id,
        title: newTask.title,
        priority: newTask.priority,
        department: newTask.department,
        deadline: newTask.deadline
      },
      ip_address: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      message: 'Task created and stored in persistent database successfully.',
      task: newTask
    });
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ error: 'Failed to create task.' });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, in_progress, completed, or cancelled.' });
    }

    const updatedTask = await db.updateTaskStatus(id, status, req.user);
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }

    return res.json({
      message: `Task status updated to ${status}. Change logged in audit trail.`,
      task: updatedTask
    });
  } catch (err) {
    console.error('Update task status error:', err);
    return res.status(500).json({ error: 'Failed to update task status.' });
  }
}

export async function getMetrics(req, res) {
  try {
    const metrics = await db.getTaskMetrics(req.user);
    return res.json({ metrics });
  } catch (err) {
    console.error('Get task metrics error:', err);
    return res.status(500).json({ error: 'Failed to compute live task metrics.' });
  }
}

export async function getTaskHistory(req, res) {
  try {
    const { id } = req.params;
    const logs = await db.getAuditLogs(req.user);
    const taskLogs = logs.filter(l => l.details && l.details.taskId === id);
    return res.json({ history: taskLogs });
  } catch (err) {
    console.error('Get task history error:', err);
    return res.status(500).json({ error: 'Failed to retrieve task activity history.' });
  }
}
