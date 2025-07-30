// frontend/src/api/model/user.js
// User API model for searching users by username
// Structure matches other model files (see order.js for reference)

import axios from 'axios';

const API_BASE_URL = "/api/account/users";

const userAPI = {
  /**
   * Search users by username (partial match)
   * @param {Object} params - { username: string }
   * @returns {Promise<Array<User>>}
   */
  async searchUsers(params) {
    // Adjust the endpoint as needed for your backend
    const response = await axios.get(`${API_BASE_URL}/`, { params });
    console.log("User search response:", response.data);
    return response.data;
  },
};

export default userAPI;
