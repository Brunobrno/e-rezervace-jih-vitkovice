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

export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return;

  const res = await fetch(`${API_URL}/account/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  } else {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export default API_URL;