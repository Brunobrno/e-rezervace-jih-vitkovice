import axios_instance from "../auth";

const API_BASE_URL = "/service-tickets";

/**
 * GET seznam tiketů.
 *
 * @param {Object} params - Možné query parametry:
 *   - user: {number} ID uživatele
 *   - status: {'new'|'in_progress'|'resolved'|'closed'}
 *   - category: {'tech'|'ServiceTicket'|'payment'|'account'|'content'|'suggestion'|'other'}
 *   - ordering: {string} např. "-created_at"
 *   - search: {string} hledání v názvu nebo popisu
 *
 * @returns {Promise<Array<ServiceTicket>>}
 */
export const getServiceTickets = async (params = {}) => {
  const response = await axios_instance.get(`${API_BASE_URL}/`, { params });
  return response.data;
};

/**
 * GET detail konkrétního tiketu.
 *
 * @param {number} id - ID tiketu
 * @returns {Promise<ServiceTicket>}
 */
export const getServiceTicketById = async (id) => {
  const response = await axios_instance.get(`${API_BASE_URL}/${id}/`);
  return response.data;
};

/**
 * POST - vytvoření nového tiketu.
 *
 * @param {Object} data - Data nového tiketu:
 *   - title: {string}
 *   - description?: {string}
 *   - user?: {number} (volitelné – backend často určí automaticky dle tokenu)
 *   - category?: {'tech'|'ServiceTicket'|'payment'|'account'|'content'|'suggestion'|'other'}
 *   - status?: {'new'|'in_progress'|'resolved'|'closed'} (výchozí "new")
 *
 * @returns {Promise<ServiceTicket>}
 */
export const createServiceTicket = async (data) => {
  const response = await axios_instance.post(`${API_BASE_URL}/`, data);
  return response.data;
};

/**
 * PATCH - částečná aktualizace tiketu.
 *
 * @param {number} id - ID tiketu
 * @param {Object} data - Libovolná pole z:
 *   - title?: {string}
 *   - description?: {string}
 *   - category?: {string}
 *   - status?: {string}
 *
 * @returns {Promise<ServiceTicket>}
 */
export const updateServiceTicket = async (id, data) => {
  const response = await axios_instance.patch(`${API_BASE_URL}/${id}/`, data);
  return response.data;
};

/**
 * DELETE - smazání tiketu.
 *
 * @param {number} id - ID tiketu
 * @returns {Promise<void>} HTTP 204 při úspěchu
 */
export const deleteServiceTicket = async (id) => {
  await axios_instance.delete(`${API_BASE_URL}/${id}/`);
};



export default {
  getServiceTickets,
  getServiceTicketById,
  createServiceTicket,
  updateServiceTicket,
  deleteServiceTicket,
};