import client from '../client';

class CreditAPI {
  static getZoneBalance(zoneId) {
    return client.get(`/credits/zone/${zoneId}/balance`);
  }

  static getZoneCredits(zoneId) {
    return client.get(`/credits/zone/${zoneId}`);
  }

  static getCreditPackages() {
    return client.get('/credits/packages');
  }

  static addCredits(zoneId, creditId, amount) {
    return client.post('/credits/zone/grant', {
      zoneId,
      creditId,
      amount,
      transaction_type: creditId ? 'Purchase' : 'Manual',
    });
  }

  static deductCredits(zoneId, amount) {
    return client.post('/credits/zone/deduct', { zoneId, amount });
  }

  static getZoneCreditsAdmin(zoneId) {
    return client.get(`/credits/admin/zone/${zoneId}`);
  }

  static getZoneBalanceAdmin(zoneId) {
    return client.get(`/credits/admin/zone/${zoneId}/balance`);
  }

  static grantCredits(payload) {
    return client.post('/credits/zone/grant', payload);
  }

  static createPackage(payload) {
    return client.post('/credits/packages', payload);
  }

  static updatePackage(id, payload) {
    return client.put(`/credits/packages/${id}`, payload);
  }

  static deletePackage(id) {
    return client.delete(`/credits/packages/${id}`);
  }

  static getSystemCosts() {
    return client.get('/system-costs');
  }

  static createSystemCost(payload) {
    return client.post('/system-costs', payload);
  }

  static updateSystemCost(id, payload) {
    return client.put(`/system-costs/${id}`, payload);
  }

  static deleteSystemCost(id) {
    return client.delete(`/system-costs/${id}`);
  }

  static getMyBalance() {
    return client.get('/credits/zone/me/balance');
  }
}

export default CreditAPI;
