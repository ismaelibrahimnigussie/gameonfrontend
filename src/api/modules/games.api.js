// src/api/modules/games.api.js
import client from "../client";

const normalizeGame = (game) => {
  if (!game) return null;
  return {
    ...game,
    id: game.id ?? game.game_id,
  };
};

const normalizeGameList = (games) => {
  if (!Array.isArray(games)) return [];
  return games.map(normalizeGame).filter(Boolean);
};

class GameAPI {
  /**
   * Get all games (Public)
   */
  static async getAllGames() {
    try {
      const response = await client.get("/games");
      return {
        ...response,
        data: normalizeGameList(response?.data),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get game by ID (Public)
   */
  static async getGameById(id) {
    try {
      const response = await client.get(`/games/${id}`);
      return {
        ...response,
        data: normalizeGame(response?.data),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get games by Zone ID (Public)
   */
  static async getGamesByZone(zoneId) {
    try {
      const response = await client.get(`/games/zone/${zoneId}`);
      return {
        ...response,
        data: normalizeGameList(response?.data),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new game (For verified Game Zones)
   */
  static async create(formData) {
    try {
      const toNumberIfPresent = (value) => {
        if (value === undefined || value === null || value === '') return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      };

      const payload = {
        zone_id: toNumberIfPresent(formData.zone_id),
        game_name: formData.game_name ? formData.game_name.trim() : null,
        description: formData.description ? formData.description.trim() : null,
        game_type: formData.game_type ? formData.game_type.trim() : null,
        max_players: toNumberIfPresent(formData.max_players),
      };

      // Enhanced validation
      if (!payload.zone_id || isNaN(payload.zone_id)) {
        throw new Error("Valid Zone ID is required");
      }
      if (!payload.game_name || payload.game_name.length < 3) {
        throw new Error("Game name must be at least 3 characters");
      }
      if (payload.max_players && (isNaN(payload.max_players) || payload.max_players < 1)) {
        throw new Error("Max players must be a positive number");
      }

      const response = await client.post("/games", payload);
      return response;
    } catch (error) {
      const errorData = error.response?.data || {};
      
      // Re-throw with more context for the UI
      const enhancedError = new Error(errorData.message || error.message || "Failed to create game");
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      throw enhancedError;
    }
  }

  /**
   * Update an existing game (Admin only)
   */
  static async update(id, formData) {
    try {
      const payload = {
        game_name: formData.game_name ? formData.game_name.trim() : null,
        description: formData.description ? formData.description.trim() : null,
        game_type: formData.game_type ? formData.game_type.trim() : null,
        max_players: formData.max_players ? Number(formData.max_players) : null,
      };

      // Validation check before network call
      if (!payload.game_name || payload.game_name.length < 3) {
        throw new Error("Game name must be at least 3 characters");
      }

      const response = await client.put(`/games/${id}`, payload);
      return response;
    } catch (error) {
      const errorData = error.response?.data || {};

      const enhancedError = new Error(errorData.message || error.message || "Failed to update game");
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      throw enhancedError;
    }
  }

  /**
   * Delete a game (Admin only)
   */
  static async delete(id) {
    try {
      const response = await client.delete(`/games/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get detailed game stats
   */
  static async getGameDetails(id) {
    try {
      const response = await client.get(`/games/${id}/details`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default GameAPI;
