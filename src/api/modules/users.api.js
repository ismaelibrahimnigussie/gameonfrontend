import client from "../client";

// ==========================================
// USER API SERVICE LAYER
// ==========================================
class UserApi {
  // ==========================================
  // USER MANAGEMENT (Admin only)
  // ==========================================
  static async getAll() {
    try {
      const response = await client.get("/users");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  static async getById(id) {
    try {
      const response = await client.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  static async update(id, data) {
    try {
      const response = await client.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  static async getStats(id) {
    try {
      const response = await client.get(`/users/${id}/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // USER PROFILE (Authenticated user)
  // ==========================================
  static async getProfile() {
    try {
      const response = await client.get("/users/profile");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  static async updateProfile(data) {
    try {
      const response = await client.put("/users/profile", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  static async getMyStats() {
    try {
      const response = await client.get("/users/profile/stats");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==========================================
  // ERROR HANDLER
  // ==========================================
  static handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText;
      return new Error(message);
    } else if (error.request) {
      return new Error("Network error - Unable to reach server");
    } else {
      return new Error(error.message || "An unexpected error occurred");
    }
  }
}

export default UserApi;