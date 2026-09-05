// Centralized REST API Service Client
// Ready to seamlessly connect to Express / Node.js Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function readResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}

export const api = {
  // Health Check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/md`);
      return await res.json();
    } catch (err) {
      console.warn('Backend offline, using client state:', err);
      return { status: 'mock' };
    }
  },

  // Auth Endpoints
  async registerUser(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (err) {
      return { success: true, message: 'User registered (client mode)', data: userData };
    }
  },

  async loginUser(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return readResponse(res);
  },

  // Generic CRUD Helper
  async fetchResource(endpoint) {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`);
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async createResource(endpoint, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) {
      return data;
    }
  }
};
