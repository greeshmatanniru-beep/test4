import { db } from '../config/db.js';
import { setRuntimeApiKey, getRuntimeApiKey } from '../services/gemini.js';
import { GoogleGenAI } from '@google/genai';

export async function getSystemHealth(req, res) {
  try {
    const isPostgres = db.isPostgres();
    const apiKey = getRuntimeApiKey() || process.env.GEMINI_API_KEY;
    const hasApiKey = !!apiKey && apiKey !== 'your_google_gemini_api_key_here';

    return res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      database: {
        driver: isPostgres ? 'PostgreSQL (pg pool active)' : 'Embedded Enterprise Adapter (Full RLS Emulation)',
        isLivePostgres: isPostgres,
        rlsEnabled: true
      },
      aiService: {
        provider: 'Google Gemini Official SDK (@google/genai)',
        hasApiKey,
        keyMasked: hasApiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'Not Configured',
        modelsConfigured: ['gemini-2.5-flash', 'gemini-2.5-pro'],
        fallbackModeActive: !hasApiKey
      },
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    });
  } catch (err) {
    console.error('Health check error:', err);
    return res.status(500).json({ error: 'System health check failed.' });
  }
}

export async function updateApiKey(req, res) {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid Gemini API key.' });
    }

    // Test the API key with a small ping to Google Gen AI
    let testSuccess = false;
    let testError = null;

    try {
      const testAI = new GoogleGenAI({ apiKey: apiKey.trim() });
      const testRes = await testAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Ping: Respond with single word "PONG"',
        config: { maxOutputTokens: 10 }
      });
      if (testRes && testRes.text) {
        testSuccess = true;
      }
    } catch (testErr) {
      testError = testErr.message;
      console.warn('API Key test warning:', testErr.message);
    }

    setRuntimeApiKey(apiKey.trim());

    await db.createAuditLog({
      user_id: req.user.id,
      action: 'API_KEY_UPDATED',
      details: {
        success: true,
        verifiedOnline: testSuccess,
        testErrorNotice: testError ? 'Configured, but ping response had warning' : 'Verified OK'
      },
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      message: 'Gemini API key updated successfully.',
      verifiedOnline: testSuccess,
      warning: testError ? `Key stored, but direct verification warning: ${testError}` : undefined
    });
  } catch (err) {
    console.error('Update API key error:', err);
    return res.status(500).json({ error: 'Failed to update Gemini API key.' });
  }
}
