import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Axios instance, můžeme používat místo globálního axios
const axios_instance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // potřebné pro cookies
});
axios_instance.defaults.xsrfCookieName = "csrftoken";
axios_instance.defaults.xsrfHeaderName = "X-CSRFToken";


// ✅ Přihlášení
export const login = async (username, password) => {
  logout();
  const response = await axios_instance.post(`/account/token/`, { username, password });
  return response.data;
};

// ❌ Odhlášení
export const logout = async () => {
  try {
    const response = await axios_instance.post('/account/logout/');
    return response.data; // např. { detail: "Logout successful" }
  } catch (err) {
    console.error("Logout failed", err);
    throw err;
  }
};


// 🔄 Obnova access tokenu pomocí refresh cookie
export const refreshAccessToken = async () => {
  try {
    const res = await axios_instance.post(`/account/token/refresh/`);
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
    const response = await axios_instance({
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
axios_instance.interceptors.response.use(
  (response) => response, // vše OK
  async (error) => {
    const originalRequest = error.config;

    // Pokud máme 401 a ještě jsme se nepokusili obnovit
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return axios_instance(originalRequest);
      }
      
      // Refresh také selhal – redirect/logout
      logout();
    }

    // jinak přepošli chybu dál
    return Promise.reject(error);
  }
);




// 👤 Funkce pro získání aktuálně přihlášeného uživatele
export async function getCurrentUser() {
  const response = await axios_instance.get(`${API_URL}/account/user/me/`);
  return response.data; // vrací data uživatele
}

// 🔒 ✔️ Jednoduchá funkce, která kontroluje přihlášení - můžeš to upravit dle potřeby
export async function isAuthenticated() {
  try {
    const user = await getCurrentUser();
    return user != null;
  } catch (err) {
    return false; // pokud padne 401, není přihlášen
  }
}



export { axios_instance, API_URL };