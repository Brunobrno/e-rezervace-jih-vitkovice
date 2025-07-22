import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Axios instance, můžeme používat místo globálního axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // potřebné pro cookies
});

// ✅ Přihlášení
export const login = async (username, password) => {
  try {
    await api.post(`/account/token/`, { username, password });
    return true;
  } catch (err) {
    console.error("Login failed", err);
    return false;
  }
};

// ❌ Odhlášení
export const logout = async () => {
  try {
    await api.post(`/account/logout/`);
  } catch (err) {
    console.error("Logout failed", err);
  }
};

// 🔄 Obnova access tokenu pomocí refresh cookie
export const refreshAccessToken = async () => {
  try {
    const res = await api.post(`/account/token/refresh/`);
    return res.data; // { access, refresh }
  } catch (err) {
    console.error("Token refresh failed", err);
    logout();
    return null;
  }
};

// 📡 Obecný request (např. pro formuláře)
export const apiRequest = async (method, endpoint, data = {}, config = {}) => {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await api({
      method,
      url,
      data: ["post", "put", "patch"].includes(method.toLowerCase()) ? data : undefined,
      params: ["get", "delete"].includes(method.toLowerCase()) ? data : undefined,
      ...config,
    });

    return response.data;
  } catch (err) {
    throw err;
  }
};

// 🔐 Axios response interceptor: automatická obnova při 401
api.interceptors.response.use(
  (response) => response, // vše OK
  async (error) => {
    const originalRequest = error.config;

    // Pokud máme 401 a ještě jsme se nepokusili obnovit
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return api(originalRequest); // znovu odešleme původní request
      }
    }

    // jinak přepošli chybu dál
    return Promise.reject(error);
  }
);

export default API_URL;




// 👤 Funkce pro získání aktuálně přihlášeného uživatele
export async function getCurrentUser() {
  try {
    const response = await axios.get(`${API_URL}/account/user/current/`, {
      withCredentials: true,  // důležité pokud používáš cookies pro auth
    });
    return response.data; // vrací data uživatele
  } catch (error) {
    console.error("Failed to fetch current user", error);
    return null;
  }
}

// 🔒 ✔️ Jednoduchá funkce, která kontroluje přihlášení - můžeš to upravit dle potřeby
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}
