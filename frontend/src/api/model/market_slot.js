import axios_instance from '../auth';

const MARKET_SLOTS_API_URL = '/booking/market-slots/';

/**
 * Získá seznam všech prodejních míst s možností filtrování.
 * @param {Object} params - Volitelné parametry:
 *   - event: ID události (integer)
 *   - status: stav slotu (empty/blocked/taken)
 *   - ordering: řazení podle pole (např. `x`, `-y`, ...)
 * @returns {Promise<Array>} - Pole objektů `MarketSlot`
 */
export const getMarketSlots = async (params = {}) => {
  const response = await axios_instance.get(MARKET_SLOTS_API_URL, { params });
  return response.data;
};

/**
 * Vytvoří nové prodejní místo.
 * @param {Object} data - Objekt s daty pro nové prodejní místo ve formátu dle API:
 *   - event: ID události (povinné)
 *   - status: stav (empty/blocked/taken)
 *   - base_size: základní velikost v m²
 *   - available_extension: možnost rozšíření v m²
 *   - x: X souřadnice
 *   - y: Y souřadnice
 *   - width: šířka slotu
 *   - height: výška slotu
 *   - price_per_m2: cena za m²
 * @returns {Promise<Object>} - Vytvořený objekt `MarketSlot`
 */
export const createMarketSlot = async (data) => {
  const response = await axios_instance.post(MARKET_SLOTS_API_URL, data);
  return response.data;
};

/**
 * Získá detail konkrétního prodejního místa podle ID.
 * @param {number} id - ID prodejního místa
 * @returns {Promise<Object>} - Objekt `MarketSlot`
 */
export const getMarketSlotById = async (id) => {
  const response = await axios_instance.get(`${MARKET_SLOTS_API_URL}${id}/`);
  return response.data;
};

/**
 * Částečně aktualizuje prodejní místo (PATCH).
 * @param {number} id - ID prodejního místa k úpravě
 * @param {Object} data - Částečný objekt s vlastnostmi k aktualizaci
 * @returns {Promise<Object>} - Aktualizovaný objekt `MarketSlot`
 */
export const updateMarketSlot = async (id, data) => {
  const response = await axios_instance.patch(`${MARKET_SLOTS_API_URL}${id}/`, data);
  return response.data;
};

/**
 * Smaže konkrétní prodejní místo podle ID.
 * @param {number} id - ID prodejního místa
 * @returns {Promise<void>} - Úspěšný DELETE vrací 204 bez obsahu
 */
export const deleteMarketSlot = async (id) => {
  const response = await axios_instance.delete(`${MARKET_SLOTS_API_URL}${id}/`);
  return response.data;
};

export default {
  getMarketSlots,
  getMarketSlotById,
  createMarketSlot,
  updateMarketSlot,
  deleteMarketSlot,
};