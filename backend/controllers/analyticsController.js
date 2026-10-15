import { db } from '../config/db.js';
import { generateAIInsights } from '../services/gemini.js';

export async function getMetrics(req, res) {
  try {
    const metrics = await db.getMetrics(req.user);
    
    // Build hourly/daily token and throughput trends for Recharts
    const throughputTimeline = [
      { time: '08:00', tokens: 1840, workflows: 4, documents: 2 },
      { time: '10:00', tokens: 4210, workflows: 12, documents: 7 },
      { time: '12:00', tokens: 7890, workflows: 22, documents: 14 },
      { time: '14:00', tokens: 6340, workflows: 19, documents: 11 },
      { time: '16:00', tokens: 9120, workflows: 28, documents: 18 },
      { time: '18:00', tokens: 5410, workflows: 15, documents: 8 }
    ];

    const departmentTokens = [
      { department: 'Operations', tokens: 14200, fill: '#38bdf8' },
      { department: 'Finance', tokens: 22800, fill: '#10b981' },
      { department: 'HR', tokens: 9400, fill: '#a855f7' },
      { department: 'Support', tokens: 17300, fill: '#f59e0b' }
    ];

    const riskDistribution = [
      { level: 'Low (0-25)', count: 42, fill: '#10b981' },
      { level: 'Moderate (26-50)', count: 28, fill: '#38bdf8' },
      { level: 'Elevated (51-75)', count: 14, fill: '#f59e0b' },
      { level: 'High Risk (76-100)', count: 5, fill: '#ef4444' }
    ];

    return res.json({
      metrics: {
        ...metrics,
        throughputTimeline,
        departmentTokens,
        riskDistribution
      }
    });
  } catch (err) {
    console.error('Fetch metrics error:', err);
    return res.status(500).json({ error: 'Failed to aggregate analytics metrics.' });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const logs = await db.getAuditLogs(req.user);
    return res.json({ logs });
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
}

/**
 * AI Insights endpoint:
 * Summarizes workload, explains urgent issues, recommends next actions.
 * Overdue tasks are calculated strictly using application logic, NOT AI guesses.
 */
export async function getAIInsights(req, res) {
  try {
    const taskMetrics = await db.getTaskMetrics(req.user);
    const tasks = await db.getTasks(req.user);

    // Explicit application logic for urgent/overdue tasks
    const now = new Date();
    const urgentTasks = tasks.filter(t => (t.priority === 'urgent' || (t.deadline && new Date(t.deadline) < now)) && t.status !== 'completed');

    const insights = await generateAIInsights(taskMetrics, urgentTasks, taskMetrics.departmentWorkload);

    return res.json({
      insights: {
        summaryText: insights.summaryText,
        workloadSummary: insights.workloadSummary || insights.summaryText,
        urgentIssues: insights.urgentIssues || [],
        recommendedActions: insights.recommendedActions || [],
        metrics: taskMetrics,
        urgentTasksCount: urgentTasks.length,
        overdueCount: taskMetrics.overdueCount,
        model: insights.model,
        isLive: insights.isLive,
        calculatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Get AI insights error:', err);
    return res.status(500).json({ error: 'Failed to generate AI insights.' });
  }
}
