import client from "../client";

class GameZoneAPI {
  static async register(formData) {
    const payload = {
      zone_name: formData.zone_name,
      address: formData.address,
      owner_name: formData.owner_name,
      owner_phone: formData.owner_phone,
      password: formData.password,
    };

    const response = await client.post("/gamezones", payload, {
      headers: { Authorization: undefined }
    });

    return response;
  }

  static async login(credentials) {
    const response = await client.post("/gamezones/login", credentials, {
      headers: { Authorization: undefined }
    });

    return response;
  }

  static async getMyProfile() {
    return await client.get("/gamezones/profile");
  }

  static async updateProfile(zoneData) {
    return await client.put("/gamezones/profile", zoneData);
  }

  static async getVerifiedZones() {
    return await client.get("/gamezones/verified");
  }

  static async getZoneById(id) {
    return await client.get(`/gamezones/${id}`);
  }

  static async getAllZones() {
    return await client.get("/gamezones");
  }

  static async getUnverifiedZones() {
    return await client.get("/gamezones/unverified");
  }

  static async updateZone(id, zoneData) {
    return await client.put(`/gamezones/${id}`, zoneData);
  }

  static async verifyZone(id) {
    return await client.patch(`/gamezones/${id}/verify`);
  }

  static async unverifyZone(id) {
    return await client.patch(`/gamezones/${id}/unverify`);
  }

  static async getZoneStats(id) {
    return await client.get(`/gamezones/${id}/stats`);
  }

  static async getAllZonesWithStats() {
    return await client.get("/gamezones/stats");
  }

  static async verifyMultipleZones(zoneIds) {
    return await client.patch("/gamezones/verify-bulk", { zone_ids: zoneIds });
  }

  static async unverifyMultipleZones(zoneIds) {
    return await client.patch("/gamezones/unverify-bulk", { zone_ids: zoneIds });
  }

  static async getVerificationSummary() {
    return await client.get("/gamezones/verification-summary");
  }

  static async searchZones(query) {
    return await client.get("/gamezones/search", { params: { q: query } });
  }

  static async getZonesByVerificationStatus(status, page = 1, limit = 20) {
    return await client.get("/gamezones/filter", {
      params: {
        verified: status === 'verified' ? 1 : 0,
        page,
        limit
      }
    });
  }

  static isZoneVerified(zoneData) {
    if (!zoneData) return false;

    const zone = zoneData.data || zoneData;

    const isVerified = zone.is_verified ??
                       zoneData.is_verified ??
                       false;

    const verifiedBy = zone.verified_by ??
                       zoneData.verified_by ??
                       null;

    return (isVerified === true || isVerified === 1) &&
           verifiedBy !== null &&
           verifiedBy !== '' &&
           verifiedBy !== '0';
  }

  static getVerificationStatus(zoneData) {
    if (!zoneData) return 'Unknown';
    return this.isZoneVerified(zoneData) ? 'Verified' : 'Unverified';
  }

  static getVerificationBadgeColor(zoneData) {
    return this.isZoneVerified(zoneData) ? 'text-emerald-400' : 'text-amber-400';
  }

  static formatZoneForDisplay(zoneData) {
    if (!zoneData) return null;

    const zone = zoneData.data || zoneData;

    return {
      ...zone,
      is_verified: this.isZoneVerified(zoneData),
      verification_status: this.getVerificationStatus(zoneData),
      display_name: zone.zone_name || 'Unnamed Zone',
      owner_display: zone.owner_name || 'Unknown Owner'
    };
  }

  static formatZonesForDisplay(zones) {
    if (!zones || !Array.isArray(zones)) return [];
    return zones.map(zone => this.formatZoneForDisplay(zone));
  }

  static validatePhoneNumber(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  static validateZoneName(name) {
    return name && name.length >= 3 && name.length <= 150;
  }

  static validatePassword(password) {
    return password && password.length >= 6;
  }

  static getVerificationDetails(zoneData) {
    if (!zoneData) {
      return { verified: false, reason: 'No data provided' };
    }

    const zone = zoneData.data || zoneData;
    const isVerified = zone.is_verified ?? zoneData.is_verified ?? false;
    const verifiedBy = zone.verified_by ?? zoneData.verified_by ?? null;

    return {
      verified: this.isZoneVerified(zoneData),
      is_verified: isVerified,
      verified_by: verifiedBy,
      reason: this.isZoneVerified(zoneData)
        ? 'Zone is verified'
        : 'Zone is not verified'
    };
  }
}

export default GameZoneAPI;
