import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, {
      username,
      password,
    });

    const { access, refresh } = response.data;
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    return true;
  } catch (err) {
    console.error("Login failed", err);
    return false;
  }
};

export const getProtectedData = async () => {
  try {
    const token = localStorage.getItem("access");

    const res = await axios.get(`${API_URL}/protected/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    console.error("Access denied or token expired", err);
  }
};

export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem("refresh");
    const response = await axios.post(`${API_URL}/token/refresh/`, {
      refresh,
    });
    localStorage.setItem("access", response.data.access);
    axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
  } catch (err) {
    console.error("Token refresh failed", err);
  }
};