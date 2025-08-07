// frontend/src/api/model/user.js
// User API model for searching users by username
// Structure matches other model files (see order.js for reference)

import axios_instance from '../auth';

const API_BASE_URL = "/account/users";

const userAPI = {
  /**
   * Get all users
   * @returns {Promise<Array<User>>}
   */
  async getUsers(params) {
    const response = await axios_instance.get(`${API_BASE_URL}/`, { params });
    return response.data;
  },

  /**
   * Get a single user by ID
   * @param {number|string} id
   * @returns {Promise<User>}
   */
  async getUser(id) {
    const response = await axios_instance.get(`${API_BASE_URL}/${id}/`);
    return response.data;
  },

  /**
   * Update a user by ID
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<User>}
   */
  async updateUser(id, data) {
    const response = await axios_instance.patch(`${API_BASE_URL}/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a user by ID
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async deleteUser(id) {
    const response = await axios_instance.delete(`${API_BASE_URL}/${id}/`);
    return response.data;
  },

  /**
   * Create a new user
   * @param {Object} data
   * @returns {Promise<User>}
   */
  async createUser(data) {
    const response = await axios_instance.post(`${API_BASE_URL}/`, data);
    return response.data;
  },

  /**
   * Search users by username (partial match)
   * @param {Object} params - { username: string }
   * @returns {Promise<Array<User>>}
   */
  async searchUsers(params) {
    // Adjust the endpoint as needed for your backend
    const response = await axios_instance.get(`${API_BASE_URL}/`, { params });
    console.log("User search response:", response.data);
    return response.data;
  },
};

export default userAPI;
