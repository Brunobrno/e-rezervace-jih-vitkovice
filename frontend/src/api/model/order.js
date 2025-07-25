import axios_instance from '../auth';

//TODO: přepsat dokumentaci na orders model 

const API_BASE_URL = '/commerce/orders';

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
export const getReservations = async (params = {}) => {
  const response = await axios_instance.get(`${API_BASE_URL}/`, { params });
  return response.data;
};

/**
 * GET detail konkrétní rezervace.
 * 
 * @param {number} id - ID rezervace
 * @returns {Promise<Reservation>}
 */
export const getReservationById = async (id) => {
  const response = await axios_instance.get(`${API_BASE_URL}/${id}/`);
  return response.data;
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
export const createReservation = async (data) => {
  const response = await axios_instance.post(`${API_BASE_URL}/`, data);
  return response.data;
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
export const updateReservation = async (id, data) => {
  const response = await axios_instance.patch(`${API_BASE_URL}/${id}/`, data);
  return response.data;
};

/**
 * DELETE - smazání rezervace.
 * 
 * @param {number} id - ID rezervace
 * @returns {Promise<void>} HTTP 204 při úspěchu
 */
export const deleteReservation = async (id) => {
  await axios_instance.delete(`${API_BASE_URL}/${id}/`);
};
