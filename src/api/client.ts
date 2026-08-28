import {
  DashboardSummary,
  RevenueChartPoint,
  Transaction,
  Customer,
  RecoveryOpportunity,
  AuditLog,
  SystemNotification,
  Merchant,
  User,
  RecoveryExperiment,
  SimulationResult,
  SimulationConfig
} from '../types';

export const apiClient = {
  // Auth
  async getMe(): Promise<{ user: User; merchant: Merchant }> {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('Failed to fetch auth state');
    return res.json();
  },

  async login(email?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async signup(name: string, email: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  // Merchant & Settings
  async completeOnboarding(profile: any): Promise<Merchant> {
    const res = await fetch('/api/merchant/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to complete onboarding');
    return res.json();
  },

  async updateMerchantSettings(settings: Partial<Merchant['recoverySettings']>): Promise<Merchant> {
    const res = await fetch('/api/merchant/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update merchant settings');
    return res.json();
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch('/api/dashboard/summary');
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  async getRevenueChart(range: '7D' | '30D' | '90D' = '7D'): Promise<RevenueChartPoint[]> {
    const res = await fetch(`/api/dashboard/revenue?range=${range}`);
    if (!res.ok) throw new Error('Failed to fetch revenue chart');
    return res.json();
  },

  // Transactions
  async getTransactions(params?: { status?: string; category?: string; search?: string; limit?: number }): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const res = await fetch(`/api/transactions?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getTransactionById(id: string): Promise<{ transaction: Transaction; customer?: Customer; opportunity?: RecoveryOpportunity }> {
    const res = await fetch(`/api/transactions/${id}`);
    if (!res.ok) throw new Error(`Transaction ${id} not found`);
    return res.json();
  },

  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : '/api/customers';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomerById(id: string): Promise<{ customer: Customer; transactions: Transaction[] }> {
    const res = await fetch(`/api/customers/${id}`);
    if (!res.ok) throw new Error(`Customer ${id} not found`);
    return res.json();
  },

  // Recovery Queue
  async getOpportunities(params?: { tab?: string; search?: string }): Promise<RecoveryOpportunity[]> {
    const searchParams = new URLSearchParams();
    if (params?.tab) searchParams.set('tab', params.tab);
    if (params?.search) searchParams.set('search', params.search);

    const res = await fetch(`/api/recovery/opportunities?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch opportunities');
    return res.json();
  },

  async getOpportunityById(id: string): Promise<{ opportunity: RecoveryOpportunity; transaction?: Transaction; customer?: Customer }> {
    const res = await fetch(`/api/recovery/opportunities/${id}`);
    if (!res.ok) throw new Error(`Opportunity ${id} not found`);
    return res.json();
  },

  async analyzeOpportunity(id: string): Promise<RecoveryOpportunity> {
    const res = await fetch(`/api/recovery/${id}/analyze`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to re-analyze opportunity');
    return res.json();
  },

  async executeRecovery(id: string, overrideManualReview = false, actor?: string) {
    const res = await fetch(`/api/recovery/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overrideManualReview, actor }),
    });
    if (!res.ok) throw new Error('Failed to execute recovery action');
    return res.json();
  },

  async executeBulkRecovery(opportunityIds: string[]) {
    const res = await fetch('/api/recovery/bulk-execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityIds }),
    });
    if (!res.ok) throw new Error('Failed to bulk execute recovery');
    return res.json();
  },

  // Simulation
  async runSimulation(config: SimulationConfig): Promise<SimulationResult> {
    const res = await fetch('/api/simulation/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to run recovery simulation');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(params?: { search?: string; entityType?: string }): Promise<AuditLog[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.entityType) searchParams.set('entityType', params.entityType);

    const res = await fetch(`/api/audit-logs?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Notifications
  async getNotifications(): Promise<SystemNotification[]> {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationsRead(): Promise<SystemNotification[]> {
    const res = await fetch('/api/notifications/read-all', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark notifications read');
    return res.json();
  },

  // Experiments
  async getExperiments(): Promise<RecoveryExperiment[]> {
    const res = await fetch('/api/experiments');
    if (!res.ok) throw new Error('Failed to fetch experiments');
    return res.json();
  },

  // Developer Keys & Webhook Simulation
  async getDeveloperKeys() {
    const res = await fetch('/api/developer/keys');
    if (!res.ok) throw new Error('Failed to fetch developer keys');
    return res.json();
  },

  async simulateWebhook(payload: any) {
    const res = await fetch('/api/developer/webhooks/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to dispatch simulated webhook');
    return res.json();
  },

  // Copilot Chat
  async queryCopilot(question: string): Promise<{ answer: string; suggestedActions?: string[] }> {
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Failed to query Copilot');
    return res.json();
  },

  // System Reset
  async resetDemoData() {
    const res = await fetch('/api/system/reset', { method: 'POST' });
    return res.json();
  },
};
