import { db } from '../config/db.js';
import {
  generateEnterpriseResponse,
  analyzeDocumentStructure,
  answerKnowledgeQuestion,
  INVOICE_EXTRACTION_SCHEMA,
  ENTERPRISE_SYSTEM_INSTRUCTION
} from '../services/gemini.js';
import { chatMessageSchema, analyzeDocumentSchema } from '../validators/validators.js';

export async function chat(req, res) {
  try {
    const parseResult = chatMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(e => e.message)
      });
    }

    const { prompt, department, documentId, mode } = parseResult.data;
    const targetDept = department || req.user.department || 'operations';

    const docs = await db.getDocuments(req.user);
    let targetDocs = [];

    if (documentId) {
      const selectedDoc = docs.find(d => d.id === documentId);
      if (selectedDoc) targetDocs = [selectedDoc];
    } else {
      // Filter by department or all documents in scope
      targetDocs = docs.filter(d => d.department === targetDept);
      if (targetDocs.length === 0 && docs.length > 0) {
        targetDocs = docs;
      }
    }

    // Call Knowledge Assistant with genuine source citation
    const knowledgeResult = await answerKnowledgeQuestion(prompt, targetDocs, targetDept);

    // Save message to chat history with genuine sources
    const savedMsg = await db.createChatMessage({
      user_id: req.user.id,
      department: targetDept,
      prompt,
      response: knowledgeResult.answer,
      sources: knowledgeResult.sources,
      tokens_used: knowledgeResult.tokensUsed
    });

    await db.createAuditLog({
      user_id: req.user.id,
      action: 'AI_KNOWLEDGE_QUERY',
      details: {
        department: targetDept,
        tokensUsed: knowledgeResult.tokensUsed,
        model: knowledgeResult.model,
        hasDocumentLink: !!documentId,
        sourcesCount: knowledgeResult.sources.length,
        isSupported: knowledgeResult.isSupported
      },
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      messageId: savedMsg.id,
      prompt,
      response: knowledgeResult.answer,
      sources: knowledgeResult.sources,
      isSupported: knowledgeResult.isSupported,
      tokensUsed: knowledgeResult.tokensUsed,
      model: knowledgeResult.model,
      isLive: knowledgeResult.isLive,
      department: targetDept,
      createdAt: savedMsg.created_at
    });
  } catch (err) {
    console.error('AI chat endpoint error:', err);
    return res.status(500).json({ error: 'AI conversational knowledge engine encountered an issue.' });
  }
}

export async function getChatHistory(req, res) {
  try {
    const department = req.query.department || req.user.department || 'operations';
    const messages = await db.getChatMessages(req.user.id, department);
    return res.json({ messages });
  } catch (err) {
    console.error('Fetch chat history error:', err);
    return res.status(500).json({ error: 'Failed to retrieve chat history.' });
  }
}

export async function analyze(req, res) {
  try {
    const parseResult = analyzeDocumentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(e => e.message)
      });
    }

    const { documentText, department } = parseResult.data;
    const result = await analyzeDocumentStructure(documentText, INVOICE_EXTRACTION_SCHEMA, department);

    await db.createAuditLog({
      user_id: req.user.id,
      action: 'AI_DEEP_DOCUMENT_ANALYSIS',
      details: {
        department,
        riskScore: result.data.riskScore,
        model: result.model
      },
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      analysis: result.data,
      tokensUsed: result.tokensUsed,
      model: result.model,
      isLive: result.isLive
    });
  } catch (err) {
    console.error('AI analyze endpoint error:', err);
    return res.status(500).json({ error: 'Deep document analysis failed.' });
  }
}
