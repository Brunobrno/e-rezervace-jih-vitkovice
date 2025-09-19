import axios_instance from '../auth';

const API_BASE_URL = '/products/event-products';

/**
 * GET seznam produktů.
 * 
 * @param {Object} params - Možné query parametry (dle backendu), např.:
 *   - search: {string} hledání v názvu/popisu
 *   - ordering: {string} např. "-created_at"
 *   - is_active: {boolean} filtr aktivních
 * 
 * @returns {Promise<Array<Product>>}
 */
export const getProducts = async (params = {}) => {
  const response = await axios_instance.get(`${API_BASE_URL}/`, { params });
  return response.data;
};

/**
 * GET detail konkrétního produktu.
 * 
 * @param {number} id - ID produktu
 * @returns {Promise<Product>}
 */
export const getProductById = async (id) => {
  const response = await axios_instance.get(`${API_BASE_URL}/${id}/`);
  return response.data;
};

/**
 * POST - vytvoření nového produktu.
 * 
 * @param {Object} data - Data nového produktu:
 *   - name: {string} název produktu
 *   - description?: {string} popis
 *   - price?: {number} cena v Kč
 *   - is_active?: {boolean} zda je aktivní
 * 
 * @returns {Promise<Product>}
 */
export const createProduct = async (data) => {
  const response = await axios_instance.post(`${API_BASE_URL}/`, data);
  return response.data;
};

/**
 * PATCH - částečná aktualizace produktu.
 * 
 * @param {number} id - ID produktu
 * @param {Object} data - Libovolné pole z:
 *   - name?: {string}
 *   - description?: {string}
 *   - price?: {number}
 *   - is_active?: {boolean}
 * @returns {Promise<Product>}
 */
export const updateProduct = async (id, data) => {
  const response = await axios_instance.patch(`${API_BASE_URL}/${id}/`, data);
  return response.data;
};

/**
 * DELETE - smazání produktu.
 * 
 * @param {number} id - ID produktu
 * @returns {Promise<void>} HTTP 204 při úspěchu
 */
export const deleteProduct = async (id) => {
  await axios_instance.delete(`${API_BASE_URL}/${id}/`);
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
