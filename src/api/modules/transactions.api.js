import client from "../client";

export default {
  getAll: () =>
    client.get("/transactions"),

  getById: (id) =>
    client.get(`/transactions/${id}`),

  getByZone: (zoneId) =>
    client.get(`/transactions/zone/${zoneId}`),

  getByPlay: (playId) =>
    client.get(`/transactions/play/${playId}`),

  create: (data) =>
    client.post("/transactions", data),

  getStats: () =>
    client.get("/transactions/stats/overview"),

  getZoneStats: (zoneId) =>
    client.get(`/transactions/stats/zone/${zoneId}`),
};