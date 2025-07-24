import axios_instance from './auth';

const API_BASE_URL = '/api/booking/events';

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
export const getEvents = (params = {}) => {
  return axios_instance.get(API_BASE_URL + '/', { params });
};

/**
 * GET detail konkrétní události.
 * 
 * @param {number} id - ID události
 * @returns {Promise<Event>}
 */
export const getEventById = (id) => {
  return axios_instance.get(`${API_BASE_URL}/${id}/`);
};

/**
 * PUT - aktualizace celé události.
 * 
 * @param {number} id - ID události
 * @param {Object} data - Kompletní data události (nahrazuje všechna existující pole)
 *   - name: {string}
 *   - description: {string}
 *   - start: {string} ISO datetime
 *   - end: {string} ISO datetime
 *   - square: {number} ID existujícího náměstí
 * @returns {Promise<Event>}
 */
export const updateEvent = (id, data) => {
  return axios_instance.put(`${API_BASE_URL}/${id}/`, data);
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
export const partialUpdateEvent = (id, data) => {
  return axios_instance.patch(`${API_BASE_URL}/${id}/`, data);
};

/**
 * DELETE - odstranění události podle ID.
 * 
 * @param {number} id - ID události
 * @returns {Promise<void>} - HTTP 204 No Content při úspěchu
 */
export const deleteEvent = (id) => {
  return axios_instance.delete(`${API_BASE_URL}/${id}/`);
};
