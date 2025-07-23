import axios from 'axios';

const SQUARE_API_URL = '/api/booking/squares/';

/**
 * Získá seznam všech náměstí s možností filtrování a fulltextového vyhledávání.
 * @param {Object} params - Volitelné parametry:
 *   - city: podle města (string)
 *   - psc: podle PSČ (integer)
 *   - width: šířka (integer)
 *   - height: výška (integer)
 *   - search: fulltext (string)
 *   - ordering: řazení podle pole (např. `name`, `-city`, ...)
 * @returns {Promise<Array>} - Pole objektů `Square`
 */
export const getAllSquares = async (params = {}) => {
  const response = await axios.get(SQUARE_API_URL, { params });
  return response.data;
};

/**
 * Získá detail konkrétního náměstí podle ID.
 * @param {number} id - ID náměstí
 * @returns {Promise<Object>} - Objekt `Square`
 */
export const getSquareById = async (id) => {
  const response = await axios.get(`${SQUARE_API_URL}${id}/`);
  return response.data;
};

/**
 * Aktualizuje celé náměstí (PUT).
 * @param {number} id - ID náměstí k úpravě
 * @param {Object} data - Kompletní objekt náměstí ve formátu dle API (např. `name`, `city`, `width`, `height`, `description`)
 * @returns {Promise<Object>} - Aktualizovaný objekt `Square`
 */
export const updateSquare = async (id, data) => {
  const response = await axios.put(`${SQUARE_API_URL}${id}/`, data);
  return response.data;
};

/**
 * Smaže konkrétní náměstí podle ID.
 * @param {number} id - ID náměstí
 * @returns {Promise<void>} - Úspěšný DELETE vrací 204 bez obsahu
 */
export const deleteSquare = async (id) => {
  const response = await axios.delete(`${SQUARE_API_URL}${id}/`);
  return response.data;
};
