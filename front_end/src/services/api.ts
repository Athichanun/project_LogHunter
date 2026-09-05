/**
 * API Service wrapper for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = {
  /**
   * Generic GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API GET request failed on ${endpoint}`);
    }
    return response.json() as Promise<T>;
  },

  /**
   * Generic POST request
   */
  async post<T, U>(endpoint: string, data: U): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API POST request failed on ${endpoint}`);
    }
    return response.json() as Promise<T>;
  }
};
