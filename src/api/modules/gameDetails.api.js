import client from "../client";

const toRequiredId = (value, fieldName) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return id;
};

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error('Numeric detail values must be valid numbers');
  return number;
};

const normalizeDetail = (detail) => {
  if (!detail) return null;
  return {
    ...detail,
    id: detail.id ?? detail.detail_id,
  };
};

const normalizeDetailList = (details) => {
  if (!Array.isArray(details)) return [];
  return details.map(normalizeDetail).filter(Boolean);
};

class GameDetailsAPI {
  static async getAll() {
    const response = await client.get("/game-details");
    return {
      ...response,
      data: normalizeDetailList(response?.data),
    };
  }

  static async getById(id) {
    const response = await client.get(`/game-details/${id}`);
    return {
      ...response,
      data: normalizeDetail(response?.data),
    };
  }

  static async getByGame(gameId) {
    const response = await client.get(`/game-details/game/${gameId}`);
    return {
      ...response,
      data: normalizeDetailList(response?.data),
    };
  }

  static async create(formData) {
    const payload = {
      game_id: toRequiredId(formData.game_id ?? formData.gameId, 'Game ID'),
      station_id: toRequiredId(formData.station_id ?? formData.stationId, 'Station ID'),
      game_rule: formData.game_rule?.trim() || undefined,
      duration_minutes: toOptionalNumber(formData.duration_minutes),
      extra_time_minutes: toOptionalNumber(formData.extra_time_minutes),
      main_price: toOptionalNumber(formData.main_price),
      extra_price: toOptionalNumber(formData.extra_price),
    };

    const response = await client.post("/game-details", payload);
    return {
      ...response,
      data: normalizeDetail(response?.data),
    };
  }

  static async update(id, formData) {
    const payload = {
      game_id: toRequiredId(formData.game_id ?? formData.gameId, 'Game ID'),
      station_id: toRequiredId(formData.station_id ?? formData.stationId, 'Station ID'),
      game_rule: formData.game_rule?.trim() || undefined,
      duration_minutes: toOptionalNumber(formData.duration_minutes),
      extra_time_minutes: toOptionalNumber(formData.extra_time_minutes),
      main_price: toOptionalNumber(formData.main_price),
      extra_price: toOptionalNumber(formData.extra_price),
    };

    const response = await client.put(`/game-details/${id}`, payload);
    return {
      ...response,
      data: normalizeDetail(response?.data),
    };
  }

  static async delete(id) {
    const response = await client.delete(`/game-details/${id}`);
    return response;
  }
}

export default GameDetailsAPI;
