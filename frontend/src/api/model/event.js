import axios_instance from '../auth';

const API_BASE_URL = '/booking/events';

/**
 * GET seznam událostí (Event).
 * 
 * Query parametry:
 * @param {Object} params
 * - search: {string} - fulltextové hledání v poli name, description, square.name, atd.
 * - city: {string} - název města (např. "Ostrava")
 * - start_after: {string} - od data (ISO datetime)
 * - end_before: {string} - do data (ISO datetime)
 * - square_size: {string} - velikost náměstí (např. "100" pro 100 m²)
 * - ordering: {string} - např. "name" nebo "-start"
 * 
 * @returns {Promise<Array<Event>>}
 */
export const getEvents = async (params = {}) => {
  const response = await axios_instance.get(API_BASE_URL + '/', { params });
  return response.data;
};

/**
 * GET detail konkrétní události.
 * 
 * @param {number} id - ID události
 * @returns {Promise<Event>}
 */
export const getEventById = async (id) => {
  const response = await axios_instance.get(`${API_BASE_URL}/${id}/`);
  return response.data;
};

/**
 * PATCH - částečná aktualizace události.
 * 
 * @param {number} id - ID události
 * @param {Object} data - Libovolná pole z modelu Event, která se mají změnit:
 *   - name?: {string}
 *   - description?: {string}
 *   - start?: {string} ISO datetime
 *   - end?: {string} ISO datetime
 *   - square?: {number}
 * @returns {Promise<Event>}
 */
export const updateEvent = async (id, data) => {
  const response = await axios_instance.patch(`${API_BASE_URL}/${id}/`, data);
  return response.data;
};

export const createEvent = async (formData) => {
  const response = await axios_instance.post(`${API_BASE_URL}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};


/**
 * DELETE - odstranění události podle ID.
 * 
 * @param {number} id - ID události
 * @returns {Promise<void>} - HTTP 204 No Content při úspěchu
 */
export const deleteEvent = async (id) => {
  await axios_instance.delete(`${API_BASE_URL}/${id}/`);
};

export default {
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};