import client from "../client";

export default {
  getAll: () => client.get("/plays"),

  getById: (id) => client.get(`/plays/${id}`),

  getActive: () => client.get("/plays/active"),

  getByPlayer: (playerId) => client.get(`/plays/player/${playerId}`),

  getByStation: (stationId) => client.get(`/plays/station/${stationId}`),

  getByZone: (zoneId) => client.get(`/plays/zone/${zoneId}`),

  // NEW: `data` can now include `player_ids: [1, 2]` instead of just `player_id`
  create: (data) => client.post("/plays", data),

  start: (id) => client.patch(`/plays/${id}/start`),

  // NEW: Trigger next round (Deducts extra_price, increments play_amount)
  continue: (id) => client.patch(`/plays/${id}/continue`),

  end: (id, data) => client.patch(`/plays/${id}/end`, data),

  cancel: (id) => client.patch(`/plays/${id}/cancel`),

  getDetails: (id) => client.get(`/plays/${id}/details`),

  getStats: () => client.get("/plays/stats/overview"),

  // --- ZONE ROUTES ---

  getZoneSessions: () => client.get("/gamezone/plays"),

  // NEW: `data` can now include `player_ids: [1, 2]`
  createZoneSession: (data) => client.post("/gamezone/plays", data),

  startZoneSession: (id) => client.patch(`/gamezone/plays/${id}/start`),

  // Add the configured extra time and price for Zone players
  continueZoneSession: (id, data = {}) => client.patch(`/gamezone/plays/${id}/continue`, data),

  addExtraTimeZoneSession: (id) => client.patch(`/gamezone/plays/${id}/extra-time`),

  addZonePlayerToSession: (id, data) => client.patch(`/gamezone/plays/${id}/add-player`, data),
  leaveZonePlayerFromSession: (id, data) => client.patch(`/gamezone/plays/${id}/leave-player`, data),

  pauseZoneSession: (id) => client.patch(`/gamezone/plays/${id}/pause`),

  resumeZoneSession: (id) => client.patch(`/gamezone/plays/${id}/resume`),

  endZoneSession: (id, data) => client.patch(`/gamezone/plays/${id}/end`, data),

  addZonePayment: (id, data) => client.post(`/gamezone/plays/${id}/payment`, data),

  payZonePlayerRounds: (id, data) => client.post(`/gamezone/plays/${id}/player-round-payment`, data),

  cancelZoneSession: (id) => client.patch(`/gamezone/plays/${id}/cancel`),

  deleteSession: (id) => client.delete(`/gamezone/plays/${id}`),

  bulkDeleteSessions: (ids) => client.post('/gamezone/plays/bulk-delete', { ids }),

  deleteSessionAdmin: (id) => client.delete(`/plays/${id}`),

  bulkDeleteSessionsAdmin: (ids) => client.post('/plays/bulk-delete', { ids }),

  claimZoneSession: (id) => client.post(`/gamezone/plays/${id}/claim`),

  getZoneSessionDetails: (id) => client.get(`/gamezone/plays/${id}/details`),

  getZoneSessionStats: () => client.get("/gamezone/plays/stats/overview"),
};
