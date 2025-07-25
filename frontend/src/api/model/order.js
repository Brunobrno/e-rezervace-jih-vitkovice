import axios_instance from '../auth';

const API_BASE_URL = '/commerce/orders';

/**
 * GET seznam objednávek.
 *
 * @param {Object} params - Možné query parametry:
 *   - reservation: {number} ID rezervace
 *   - user: {number} ID uživatele
 *   - ordering: {string} např. "-created_at"
 *   - search: {string} hledání napříč uživatelem, poznámkou, názvem události atd.
 *
 * @returns {Promise<Array<Order>>}
 */
export const getOrders = async (params = {}) => {
  const response = await axios_instance.get(`${API_BASE_URL}/`, { params });
  return response.data;
};

/**
 * GET detail konkrétní objednávky.
 *
 * @param {string} uuid - UUID objednávky
 * @returns {Promise<Order>}
 */
export const getOrderByUuid = async (uuid) => {
  const response = await axios_instance.get(`${API_BASE_URL}/${uuid}/`);
  return response.data;
};

/**
 * POST - vytvoření nové objednávky.
 *
 * @param {Object} data - Data nové objednávky:
 *   - reservation: {number} ID rezervace
 *   - price?: {string} vlastní cena (volitelné, pokud se liší od ceny rezervace)
 *
 * @returns {Promise<Order>}
 */
export const createOrder = async (data) => {
  const response = await axios_instance.post(`${API_BASE_URL}/`, data);
  return response.data;
};

/**
 * PATCH - částečná aktualizace objednávky.
 *
 * @param {string} uuid - UUID objednávky
 * @param {Object} data - Libovolné pole z:
 *   - price?: {string}
 *
 * @returns {Promise<Order>}
 */
export const updateOrder = async (uuid, data) => {
  const response = await axios_instance.patch(`${API_BASE_URL}/${uuid}/`, data);
  return response.data;
};

/**
 * DELETE - smazání objednávky.
 *
 * @param {string} uuid - UUID objednávky
 * @returns {Promise<void>} HTTP 204 při úspěchu
 */
export const deleteOrder = async (uuid) => {
  await axios_instance.delete(`${API_BASE_URL}/${uuid}/`);
};
