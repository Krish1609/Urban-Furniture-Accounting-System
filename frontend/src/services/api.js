// Centralized REST API Service Client connected to FurniLedger Express Backend & XAMPP MySQL Database

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('furniledger_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Health & Status
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch (err) {
      return { status: 'mock', message: 'Offline mode' };
    }
  },

  // Auth Endpoints
  async registerUser(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to create user account');
    }
    return data;
  },

  async loginUser(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Invalid Login ID or Password');
    }
    if (data.token) localStorage.setItem('furniledger_token', data.token);
    return data;
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async forgotPassword(loginOrEmail) {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginOrEmail }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to send password reset code');
    }
    return data;
  },

  async verifyResetOtp({ loginOrEmail, otp, newPassword }) {
    const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginOrEmail, otp, newPassword }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to verify OTP and reset password');
    }
    return data;
  },

  async getAllUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return [];
    }
  },

  async updateUser(id, userData) {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to update user');
    }
    return data;
  },

  async resetUserPassword(id, newPassword = 'Password@123') {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to delete user');
    }
    return data;
  },

  // Contacts (Customers & Vendors)
  async getContacts() {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createContact(contactData) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(contactData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: contactData };
    }
  },

  async updateContact(id, contactData) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(contactData),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async deleteContact(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Products & Services
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createProduct(productData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: productData };
    }
  },

  async updateProduct(id, productData) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async deleteProduct(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Orders (Sales & Purchases)
  async getOrders() {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: orderData };
    }
  },

  async convertOrderToBill(orderId) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/convert-to-bill`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async convertOrderToInvoice(orderId) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/convert-to-invoice`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Invoices & Vendor Bills
  async getInvoices() {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createInvoice(invoiceData) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(invoiceData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: invoiceData };
    }
  },

  async payInvoice(invoiceId, payload = { paymentMethod: 'HDFC Bank' }) {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // Accounting (Chart of Accounts, Journals, Journal Entries)
  async getChartOfAccounts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/accounting/chart-of-accounts${query ? `?${query}` : ''}`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createAccount(accData) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/chart-of-accounts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(accData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: accData };
    }
  },

  async toggleArchiveAccount(id, isArchived) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/chart-of-accounts/${id}/archive`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isArchived }),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async getJournals() {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/journals`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createJournal(journalData) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/journals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(journalData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: journalData };
    }
  },

  async updateJournal(id, journalData) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/journals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(journalData),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async getJournalEntries() {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/journal-entries`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createJournalEntry(jeData) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/journal-entries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(jeData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: jeData };
    }
  },

  // Budgets & Analytic Accounts
  async getBudgets() {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createBudget(budgetData) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(budgetData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: budgetData };
    }
  },

  async updateBudget(id, budgetData) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(budgetData),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async reviseBudget(id, payload = {}) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets/${id}/revise`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  async getAnalyticAccounts() {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets/analytics`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      return null;
    }
  },

  async createAnalyticAccount(anData) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets/analytics`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(anData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: anData };
    }
  },

  // Financial Reports
  async getProfitLoss() {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/profit-loss`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || null;
    } catch (err) {
      return null;
    }
  },

  async getBalanceSheet() {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/balance-sheet`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || null;
    } catch (err) {
      return null;
    }
  },

  async getTrialBalance() {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/trial-balance`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || null;
    } catch (err) {
      return null;
    }
  },

  async getTaxSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/tax-summary`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || null;
    } catch (err) {
      return null;
    }
  },

  // Dashboard Stats
  async getDashboardStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || null;
    } catch (err) {
      return null;
    }
  },

  // User Portal
  async getPortalData(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/portal${query ? `?${query}` : ''}`, { headers: getHeaders() });
      const data = await res.json();
      return data.data || null;
    } catch (err) {
      return null;
    }
  }
};
