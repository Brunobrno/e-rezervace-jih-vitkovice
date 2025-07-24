import axios_instance from '../auth';

const API_BASE_URL = '/booking/reservations';

/**
 * GET seznam rezervací.
 * 
 * @param {Object} params - Možné query parametry:
 *   - event: {number} ID události
 *   - user: {number} ID uživatele
 *   - status: {'reserved'|'cancelled'} Filtr na stav rezervace
 *   - ordering: {string} např. "-created_at"
 *   - search: {string} hledání v poli poznámka, uživatel, název události atd.
 * 
 * @returns {Promise<Array<Reservation>>}
 */
const getReservations = (params = {}) => {
  return axios_instance.get(`${API_BASE_URL}/`, { params });
};

/**
 * GET detail konkrétní rezervace.
 * 
 * @param {number} id - ID rezervace
 * @returns {Promise<Reservation>}
 */
const getReservationById = (id) => {
  return axios_instance.get(`${API_BASE_URL}/${id}/`);
};

/**
 * POST - vytvoření nové rezervace.
 * 
 * @param {Object} data - Data nové rezervace:
 *   - event: {number} ID události
 *   - user: {number} ID uživatele (většinou backend vyplní automaticky podle tokenu)
 *   - note?: {string} poznámka k rezervaci
 *   - status?: {'reserved'|'cancelled'} (výchozí "reserved")
 *   - cells: {number[]} seznam ID rezervovaných buněk
 * 
 * @returns {Promise<Reservation>}
 */
const createReservation = (data) => {
  return axios_instance.post(`${API_BASE_URL}/`, data);
};

/**
 * PUT - kompletní aktualizace rezervace.
 * 
 * @param {number} id - ID rezervace
 * @param {Object} data - Kompletní data rezervace (všechna pole jako v POST)
 * @returns {Promise<Reservation>}
 */
const updateReservation = (id, data) => {
  return axios_instance.put(`${API_BASE_URL}/${id}/`, data);
};

/**
 * PATCH - částečná aktualizace rezervace.
 * 
 * @param {number} id - ID rezervace
 * @param {Object} data - Libovolné pole z:
 *   - event?: {number}
 *   - note?: {string}
 *   - status?: {'reserved'|'cancelled'}
 *   - cells?: {number[]}
 * @returns {Promise<Reservation>}
 */
const partialUpdateReservation = (id, data) => {
  return axios_instance.patch(`${API_BASE_URL}/${id}/`, data);
};

/**
 * DELETE - smazání rezervace.
 * 
 * @param {number} id - ID rezervace
 * @returns {Promise<void>} HTTP 204 při úspěchu
 */
const deleteReservation = (id) => {
  return axios_instance.delete(`${API_BASE_URL}/${id}/`);
};

export default {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  partialUpdateReservation,
  deleteReservation
};
