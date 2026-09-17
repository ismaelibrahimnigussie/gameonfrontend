import client from "../client";

export default {
  getAll: () => client.get("/admins"),

  getById: (id) => client.get(`/admins/${id}`),

  create: (data) => client.post("/admins", data),

  update: (id, data) => client.put(`/admins/${id}`, data),

  updateStatus: (id, data) =>
    client.patch(`/admins/${id}/status`, data),

  delete: (id) => client.delete(`/admins/${id}`),
  bulkDelete: (ids) => client.post('/admins/bulk-delete', { ids }),

  getStats: (id) => client.get(`/admins/${id}/stats`),
};