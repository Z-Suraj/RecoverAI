import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dataStore } from './server/services/dataStore.js';
import { simulationEngine } from './server/services/simulationEngine.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'RecoverAI Enterprise Operations API',
      timestamp: new Date().toISOString(),
      environment: 'demo-simulation',
    });
  });

  // Auth Routes
  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = dataStore.getUser();
    if (email) {
      user.email = email;
    }
    dataStore.addAuditLog({
      event: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      actor: user.name,
      decision: 'AUTHENTICATE_SESSION',
      result: 'AUTHORIZED',
    });
    res.json({ user, token: 'demo_jwt_token_recoverai' });
  });

  app.post('/api/auth/signup', (req, res) => {
    const { name, email } = req.body;
    const user = dataStore.getUser();
    if (name) user.name = name;
    if (email) user.email = email;
    res.json({ user, token: 'demo_jwt_token_recoverai' });
  });

  app.post('/api/auth/logout', (req, res) => {
    const user = dataStore.getUser();
    dataStore.addAuditLog({
      event: 'USER_LOGOUT',
      entityType: 'AUTH',
      entityId: user.id,
      actor: user.name,
      decision: 'TERMINATE_SESSION',
      result: 'SUCCESS',
    });
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    res.json({ user: dataStore.getUser(), merchant: dataStore.getMerchant() });
  });

  // Merchant & Onboarding
  app.get('/api/merchant', (req, res) => {
    res.json(dataStore.getMerchant());
  });

  app.post('/api/merchant/onboarding', (req, res) => {
    const merchant = dataStore.completeOnboarding(req.body);
    res.json(merchant);
  });

  app.patch('/api/merchant/settings', (req, res) => {
    const merchant = dataStore.updateMerchantSettings(req.body);
    res.json(merchant);
  });

  // Dashboard
  app.get('/api/dashboard/summary', (req, res) => {
    res.json(dataStore.getDashboardSummary());
  });

  app.get('/api/dashboard/revenue', (req, res) => {
    const range = (req.query.range as '7D' | '30D' | '90D') || '7D';
    res.json(dataStore.getRevenueChart(range));
  });

  // Transactions
  app.get('/api/transactions', (req, res) => {
    const { status, category, search, limit } = req.query;
    const list = dataStore.getTransactions({
      status: status as string,
      category: category as string,
      search: search as string,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(list);
  });

  app.get('/api/transactions/:id', (req, res) => {
    const txn = dataStore.getTransactionById(req.params.id);
    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const customer = dataStore.getCustomerById(txn.customerId);
    const opp = dataStore.getOpportunities().find((o) => o.transactionId === txn.id);
    res.json({ transaction: txn, customer, opportunity: opp });
  });

  // Customers
  app.get('/api/customers', (req, res) => {
    const search = req.query.search as string;
    res.json(dataStore.getCustomers(search));
  });

  app.get('/api/customers/:id', (req, res) => {
    const customer = dataStore.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const transactions = dataStore.getTransactions().filter((t) => t.customerId === customer.id);
    res.json({ customer, transactions });
  });

  // Recovery Queue
  app.get('/api/recovery/opportunities', (req, res) => {
    const { tab, search } = req.query;
    res.json(dataStore.getOpportunities({ tab: tab as string, search: search as string }));
  });

  app.get('/api/recovery/opportunities/:id', (req, res) => {
    const opp = dataStore.getOpportunityById(req.params.id);
    if (!opp) {
      return res.status(404).json({ error: 'Recovery opportunity not found' });
    }
    const txn = dataStore.getTransactionById(opp.transactionId);
    const customer = dataStore.getCustomerById(opp.customerId);
    res.json({ opportunity: opp, transaction: txn, customer });
  });

  app.post('/api/recovery/:id/analyze', async (req, res) => {
    try {
      const opp = await dataStore.reAnalyzeOpportunity(req.params.id);
      res.json(opp);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/recovery/:id/execute', async (req, res) => {
    try {
      const { overrideManualReview, actor } = req.body || {};
      const result = await dataStore.executeRecoveryAction({
        opportunityId: req.params.id,
        overrideManualReview: Boolean(overrideManualReview),
        actor: actor || 'Suraj Kumar (Operations Manager)',
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/recovery/bulk-execute', async (req, res) => {
    try {
      const { opportunityIds } = req.body;
      if (!Array.isArray(opportunityIds) || opportunityIds.length === 0) {
        return res.status(400).json({ error: 'opportunityIds array is required' });
      }
      const result = await dataStore.executeBulkRecovery(opportunityIds);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Simulation
  app.post('/api/simulation/run', (req, res) => {
    try {
      const { transactionCount, scenario, autoExecuteHighProbability } = req.body;
      const result = simulationEngine.runSimulation({
        transactionCount: Number(transactionCount) || 1000,
        scenario: scenario || 'NORMAL_DAY',
        autoExecuteHighProbability: autoExecuteHighProbability !== false,
      });

      dataStore.addAuditLog({
        event: 'SIMULATION_RUN_COMPLETED',
        entityType: 'SIMULATION',
        entityId: result.id,
        actor: 'RecoverAI Simulation Engine',
        decision: `RUN_${result.scenario.toUpperCase()}`,
        result: `ANALYZED_${result.transactionsAnalyzed}_RECOVERED_INR_${result.successfullyRecovered}`,
        metadata: { result },
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    const { search, entityType, limit } = req.query;
    res.json(dataStore.getAuditLogs({
      search: search as string,
      entityType: entityType as string,
      limit: limit ? Number(limit) : undefined,
    }));
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    res.json(dataStore.getNotifications());
  });

  app.post('/api/notifications/read-all', (req, res) => {
    res.json(dataStore.markAllNotificationsRead());
  });

  // Experiments
  app.get('/api/experiments', (req, res) => {
    res.json(dataStore.getExperiments());
  });

  // Developer & Webhooks
  app.get('/api/developer/keys', (req, res) => {
    res.json({
      environment: 'sandbox-test',
      publishableKey: 'pk_test_rec_8912048120938102',
      secretKeyMasked: 'sk_test_••••••••••••••••3821',
      webhookSecretMasked: 'whsec_••••••••••••••••9412',
      webhookUrl: `${req.protocol}://${req.get('host')}/api/webhooks/incoming`,
    });
  });

  app.post('/api/developer/webhooks/simulate', (req, res) => {
    try {
      const result = dataStore.processWebhookEvent(req.body);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Copilot Contextual Assistant
  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }
      const response = await dataStore.queryCopilot(question);
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Real-time SSE Stream
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    dataStore.addSSEClient(res);

    // Initial handshake
    res.write(`event: CONNECTED\ndata: ${JSON.stringify({ status: 'LIVE', time: new Date().toISOString(), eventsPerSec: 1.4 })}\n\n`);
  });

  // Reports CSV Export
  app.get('/api/reports/download-csv', (req, res) => {
    const opps = dataStore.getOpportunities();
    const rows = [
      ['Opportunity ID', 'Transaction ID', 'Customer Name', 'Amount (INR)', 'Category', 'Failure Reason', 'Recovery Probability', 'Status', 'Recommended Action'],
      ...opps.map((o) => [
        o.id,
        o.transactionId,
        `"${o.customerName}"`,
        o.amount,
        o.category,
        o.failureReason,
        `${o.aiDiagnosis.recoveryProbability}%`,
        o.status,
        o.aiDiagnosis.recommendedAction,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="recoverai-revenue-recovery-report.csv"');
    res.send(csvContent);
  });

  // Reset Demo State
  app.post('/api/system/reset', (req, res) => {
    res.json(dataStore.resetDemoData());
  });

  // ==========================================
  // VITE MIDDLEWARE / STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RecoverAI Fintech Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
