import client from "../client";

// ==========================================
// GAME ZONE API - Professional & Modular
// ==========================================
class GameZoneAPI {
  // ==========================================
  // AUTHENTICATION (Public) - Using GameZone routes
  // ==========================================
  
  /**
   * Register a new game zone
   * @param {Object} formData - Zone registration data
   * @returns {Promise} Registration response with token
   */
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

  /**
   * Login game zone
   * @param {Object} credentials - { owner_phone, password }
   * @returns {Promise} Login response with token and profile
   */
  static async login(credentials) {
    const response = await client.post("/gamezones/login", credentials, {
      headers: { Authorization: undefined }
    });
    
    return response;
  }

  // ==========================================
  // PROFILE MANAGEMENT (Authenticated Game Zone)
  // ==========================================
  
  /**
   * Get current game zone profile
   * @returns {Promise} Profile data
   */
  static async getMyProfile() {
    return await client.get("/gamezones/profile");
  }

  /**
   * Update game zone profile
   * @param {Object} zoneData - Profile data to update
   * @returns {Promise} Updated profile
   */
  static async updateProfile(zoneData) {
    return await client.put("/gamezones/profile", zoneData);
  }

  // ==========================================
  // ZONE MANAGEMENT (Public)
  // ==========================================
  
  /**
   * Get all verified zones (Public)
   * @returns {Promise} List of verified zones
   */
  static async getVerifiedZones() {
    return await client.get("/gamezones/verified");
  }

  /**
   * Get zone by ID (Public)
   * @param {number|string} id - Zone ID
   * @returns {Promise} Zone data
   */
  static async getZoneById(id) {
    return await client.get(`/gamezones/${id}`);
  }

  // ==========================================
  // ZONE MANAGEMENT (Admin Only)
  // ==========================================
  
  /**
   * Get all zones (Admin only)
   * @returns {Promise} List of all zones
   */
  static async getAllZones() {
    return await client.get("/gamezones");
  }

  /**
   * Get unverified zones (Admin only)
   * @returns {Promise} List of unverified zones
   */
  static async getUnverifiedZones() {
    return await client.get("/gamezones/unverified");
  }

  /**
   * Update any zone by ID (Admin only)
   * @param {number|string} id - Zone ID
   * @param {Object} zoneData - Zone data to update
   * @returns {Promise} Updated zone
   */
  static async updateZone(id, zoneData) {
    return await client.put(`/gamezones/${id}`, zoneData);
  }

  /**
   * Verify a zone (Admin only)
   * @param {number|string} id - Zone ID to verify
   * @returns {Promise} Verification response
   */
  static async verifyZone(id) {
    return await client.patch(`/gamezones/${id}/verify`);
  }

  /**
   * Unverify a zone (Admin only)
   * @param {number|string} id - Zone ID to unverify
   * @returns {Promise} Unverification response
   */
  static async unverifyZone(id) {
    return await client.patch(`/gamezones/${id}/unverify`);
  }

  // ==========================================
  // STATISTICS
  // ==========================================
  
  /**
   * Get zone statistics
   * @param {number|string} id - Zone ID
   * @returns {Promise} Zone statistics
   */
  static async getZoneStats(id) {
    return await client.get(`/gamezones/${id}/stats`);
  }

  /**
   * Get all zones with statistics (Admin only)
   * @returns {Promise} Zones with statistics
   */
  static async getAllZonesWithStats() {
    return await client.get("/gamezones/stats");
  }

  // ==========================================
  // BULK OPERATIONS (Admin only)
  // ==========================================
  
  /**
   * Verify multiple zones (Admin only)
   * @param {Array} zoneIds - Array of zone IDs
   * @returns {Promise} Bulk verification response
   */
  static async verifyMultipleZones(zoneIds) {
    return await client.patch("/gamezones/verify-bulk", { zone_ids: zoneIds });
  }

  /**
   * Unverify multiple zones (Admin only)
   * @param {Array} zoneIds - Array of zone IDs
   * @returns {Promise} Bulk unverification response
   */
  static async unverifyMultipleZones(zoneIds) {
    return await client.patch("/gamezones/unverify-bulk", { zone_ids: zoneIds });
  }

  /**
   * Get verification summary (Admin only)
   * @returns {Promise} Verification summary
   */
  static async getVerificationSummary() {
    return await client.get("/gamezones/verification-summary");
  }

  // ==========================================
  // SEARCH & FILTER (Admin only)
  // ==========================================
  
  /**
   * Search zones by name or owner (Admin only)
   * @param {string} query - Search query
   * @returns {Promise} Search results
   */
  static async searchZones(query) {
    return await client.get("/gamezones/search", { params: { q: query } });
  }

  /**
   * Get zones by verification status with pagination (Admin only)
   * @param {string} status - 'verified' or 'unverified'
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Paginated zones
   */
  static async getZonesByVerificationStatus(status, page = 1, limit = 20) {
    return await client.get("/gamezones/filter", {
      params: { 
        verified: status === 'verified' ? 1 : 0,
        page,
        limit 
      }
    });
  }

  // ==========================================
  // HELPER METHODS (Utility Functions)
  // ==========================================
  
  /**
   * Check if a zone is verified
   * @param {Object} zoneData - Zone data object
   * @returns {boolean} True if verified
   */
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

  /**
   * Get verification status message
   * @param {Object} zoneData - Zone data object
   * @returns {string} 'Verified' or 'Unverified'
   */
  static getVerificationStatus(zoneData) {
    if (!zoneData) return 'Unknown';
    return this.isZoneVerified(zoneData) ? 'Verified' : 'Unverified';
  }

  /**
   * Get verification badge color
   * @param {Object} zoneData - Zone data object
   * @returns {string} CSS color class
   */
  static getVerificationBadgeColor(zoneData) {
    return this.isZoneVerified(zoneData) ? 'text-emerald-400' : 'text-amber-400';
  }

  /**
   * Format zone data for display
   * @param {Object} zoneData - Raw zone data
   * @returns {Object} Formatted zone data
   */
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

  /**
   * Format multiple zones for display
   * @param {Array} zones - Array of zone data
   * @returns {Array} Formatted zones
   */
  static formatZonesForDisplay(zones) {
    if (!zones || !Array.isArray(zones)) return [];
    return zones.map(zone => this.formatZoneForDisplay(zone));
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  static validatePhoneNumber(phone) {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  /**
   * Validate zone name
   * @param {string} name - Zone name to validate
   * @returns {boolean} True if valid
   */
  static validateZoneName(name) {
    return name && name.length >= 3 && name.length <= 150;
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {boolean} True if valid
   */
  static validatePassword(password) {
    return password && password.length >= 6;
  }

  /**
   * Get verification details (for debugging)
   * @param {Object} zoneData - Zone data
   * @returns {Object} Detailed verification info
   */
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