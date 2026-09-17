import client from "../client";

const normalizeStation = (station) => {
  if (!station) return null;
  return {
    ...station,
    id: station.id ?? station.station_id,
  };
};

const normalizeStationList = (stations) => {
  if (!Array.isArray(stations)) return [];
  return stations.map(normalizeStation).filter(Boolean);
};

class StationAPI {
  // Get all stations (Public/Admin)
  static async getAllStations() {
    const response = await client.get("/stations");
    return { ...response, data: normalizeStationList(response?.data) };
  }

  // Get a station by ID
  static async getStationById(id) {
    const response = await client.get(`/stations/${id}`);
    return { ...response, data: normalizeStation(response?.data) };
  }

  // Get stations associated with a specific Game ID
  static async getStationsByGame(gameId) {
    const response = await client.get(`/stations/game/${gameId}`);
    return { ...response, data: normalizeStationList(response?.data) };
  }

  // Find a station by scanning its QR code string
  static async getStationByQR(qrCode) {
    const response = await client.get(`/stations/qr/${qrCode}`);
    return { ...response, data: normalizeStation(response?.data) };
  }

  // Create a new station (Admin)
  static async create(formData) {
    const gameId = formData?.game_id ?? formData?.gameId ?? null;
    const stationName = formData?.station_name ?? formData?.stationName ?? '';
    const payload = {
      game_id: gameId !== undefined && gameId !== null && gameId !== '' ? Number(gameId) : null,
      station_name: String(stationName || '').trim(),
      status: formData?.status || 'Available',
    };
    const response = await client.post('/stations', payload);
    return { ...response, data: normalizeStation(response?.data ?? response) };
  }

  // Update an existing station (Admin)
  static async update(id, formData) {
    const gameId = formData?.game_id ?? formData?.gameId ?? undefined;
    const stationName = formData?.station_name ?? formData?.stationName ?? '';
    const payload = {
      game_id: gameId !== undefined && gameId !== null && gameId !== '' ? Number(gameId) : undefined,
      station_name: String(stationName || '').trim(),
      status: formData?.status || 'Available',
    };
    const response = await client.put(`/stations/${id}`, payload);
    return { ...response, data: normalizeStation(response?.data ?? response) };
  }

  // Update only the station status (Admin/Staff)
  static async updateStatus(id, statusValue) {
    const payload = { status: statusValue };
    const response = await client.patch(`/stations/${id}/status`, payload);
    return { ...response, data: normalizeStation(response?.data) };
  }

  // Delete a station (Admin)
  static async delete(id) {
    return await client.delete(`/stations/${id}`);
  }

  // Get advanced details/logs for a station (Admin)
  static async getStationDetails(id) {
    return await client.get(`/stations/${id}/details`);
  }

  // --- NEW METHODS ---

  // Assign a specific player, registered user, or create a random guest to a station
  // payload: { player_id: 1 } OR { user_id: 5, nickname: "Ismael" } OR { nickname: "Guest" }
  static async assignPlayer(stationId, playerData) {
    return await client.post(`/stations/${stationId}/assign-player`, playerData);
  }

  // Get candidate random players that can be used as a replacement for a transfer
  static async getReplacementPlayers(stationId, sessionId = null) {
    const response = await client.get(`/stations/${stationId}/replacement-players`, {
      params: sessionId ? { session_id: sessionId } : undefined
    });
    return response;
  }

  // Move an existing player to a different station after a session ends
  // payload: { player_id: 1, session_id: 99, replacement_player_id: 44 }
  static async transferPlayer(stationId, playerData) {
    return await client.post(`/stations/${stationId}/transfer-player`, playerData);
  }

  // Start a play session directly from the station
  // payload: { detail_id: 3, player_ids: [1, 2], credits_used: 0 } 
  // OR payload: { detail_id: 3, player_count: 4 } (Auto-generates 4 random players)
  static async startSession(stationId, sessionData) {
    return await client.post(`/stations/${stationId}/start-session`, sessionData);
  }
}

export default StationAPI;
