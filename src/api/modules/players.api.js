import client from "../client";

export default {
  getAll: () => client.get("/players"),

  getById: (id) => client.get(`/players/${id}`),

  getByUser: (userId) => client.get(`/players/user/${userId}`),

  // NEW: Get all players currently assigned to a specific station
  getByStation: (stationId) => client.get(`/players/station/${stationId}`),

  create: (data) => client.post("/players", data),

  // NEW: Quickly generate a random/guest player for a station
  // payload: { station_id: 5, nickname: "Guest 1" }
  createRandom: (data) => client.post("/players/random", data),

  resolveForStation: (data) => client.post("/players/resolve-station", data),

  requestStationAssignment: (data) => client.post('/players/station-request', data),
  getMyStationRequests: () => client.get('/players/station-requests'),

  update: (id, data) => client.put(`/players/${id}`, data),

  delete: (id) => client.delete(`/players/${id}`),

  bulkDelete: (ids) => client.post('/players/bulk-delete', { ids }),

  getHistory: (id) => client.get(`/players/${id}/history`),

  getStats: (id) => client.get(`/players/${id}/stats`),
};