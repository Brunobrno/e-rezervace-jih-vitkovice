import axios from "axios";

// 📍 Adresa tvého Django backendu (můžeš ji mít ve .env)
const API_URL = "http://127.0.0.1:8000/api";

// 🔐 Klíče v localStorage pro tokeny
const ACCESS_TOKEN_KEY = "user_access_token";
const REFRESH_TOKEN_KEY = "user_refresh_token";

// 🛠 Helper: nastaví access token do hlavičky Axiosu
const setAxiosAuthHeader = (accessToken) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
};

// ✅ Přihlášení uživatele – získá tokeny a uloží je
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, {
      username,
      password,
    });

    const { access, refresh } = response.data;

    // uložíme tokeny
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);

    // nastavíme hlavičku
    setAxiosAuthHeader(access);
    return true;
  } catch (err) {
    console.error("Login failed", err);
    return false;
  }
};

// ❌ Odhlášení uživatele – smaže tokeny
export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  delete axios.defaults.headers.common["Authorization"];
};

// 📡 Volání chráněného endpointu (použije aktuální token)
export const getProtectedData = async () => {
  try {
    const res = await axios.get(`${API_URL}/protected/`);
    return res.data;
  } catch (err) {
    console.error("Access denied or token expired", err);
  }
};

// 🔄 Obnova access tokenu pomocí refresh tokenu
export async function refreshAccessToken() {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) return null;

  try {
    const res = await axios.post(`${API_URL}/token/refresh/`, {
      refresh: refresh,
    });

    const { access } = res.data;

    // uložíme nový access token
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    setAxiosAuthHeader(access);
    return access;
  } catch (err) {
    console.error("Token refresh failed", err);
    logout(); // pokud selže, odhlásíme uživatele
    return null;
  }
}

// 🧠 Při načtení stránky: pokud existuje token, nastav ho do axios
const existingToken = localStorage.getItem(ACCESS_TOKEN_KEY);
if (existingToken) {
  setAxiosAuthHeader(existingToken);
}

// ⚠️ Axios interceptor: automaticky obnoví access token při expiraci (401)
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Pokud je odpověď 401 a request ještě nebyl retrynutý
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem(REFRESH_TOKEN_KEY)
    ) {
      originalRequest._retry = true;
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return axios(originalRequest); // zkusíme znovu s novým tokenem
      }
    }

    return Promise.reject(error);
  }
);

export default API_URL;
