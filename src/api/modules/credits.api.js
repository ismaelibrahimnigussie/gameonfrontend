// src/api/modules/credits.api.js
import client from "../client";

class CreditAPI {
  /**
   * Get credit balance for a specific zone
   * Matches: GET /credits/zone/:zoneId/balance
   */
  static async getZoneBalance(zoneId) {
    try {
      const data = await client.get(`/credits/zone/${zoneId}/balance`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get credit history / transactions for a zone
   * (You can expand this later)
   */
  static async getZoneCredits(zoneId) {
    try {
      const data = await client.get(`/credits/zone/${zoneId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all credit packages (for top-up options)
   */
  static async getCreditPackages() {
    try {
      const data = await client.get('/credits/packages');
      return data;
    } catch (error) {
      throw error;
    }
  }

  // ==================== ADMIN / FUTURE METHODS ====================

  /**
   * Add credits to a zone (Admin only)
   */
  static async addCredits(zoneId, creditId, amount) {
    try {
      const data = await client.post('/credits/zone/grant', {
        zoneId,
        creditId,
        amount,
        transaction_type: creditId ? 'Purchase' : 'Manual'
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deduct credits from a zone (Admin / System use)
   */
  static async deductCredits(zoneId, amount) {
    try {
      const data = await client.post('/credits/zone/deduct', {
        zoneId,
        amount
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getZoneCreditsAdmin(zoneId) {
    try {
      const data = await client.get(`/credits/admin/zone/${zoneId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getZoneBalanceAdmin(zoneId) {
    try {
      const data = await client.get(`/credits/admin/zone/${zoneId}/balance`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async grantCredits(payload) {
    try {
      const data = await client.post('/credits/zone/grant', payload);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async createPackage(payload) {
    try {
      const data = await client.post('/credits/packages', payload);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updatePackage(id, payload) {
    try {
      const data = await client.put(`/credits/packages/${id}`, payload);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async deletePackage(id) {
    try {
      const data = await client.delete(`/credits/packages/${id}`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getSystemCosts() { return client.get('/system-costs'); }
  static async createSystemCost(payload) { return client.post('/system-costs', payload); }
  static async updateSystemCost(id, payload) { return client.put(`/system-costs/${id}`, payload); }
  static async deleteSystemCost(id) { return client.delete(`/system-costs/${id}`); }

  // Optional: Get current authenticated zone's balance (if you implement /credits/balance later)
  static async getMyBalance() {
    try {
      const data = await client.get('/credits/zone/me/balance'); // or adjust route
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default CreditAPI;
