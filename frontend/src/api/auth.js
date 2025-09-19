import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Axios instance, můžeme používat místo globálního axios
const axios_instance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // potřebné pro cookies
});
axios_instance.defaults.xsrfCookieName = "csrftoken";
axios_instance.defaults.xsrfHeaderName = "X-CSRFToken";

// Axios instance without Authorization for auth endpoints (refresh/login/logout)
const axios_no_auth = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
axios_no_auth.defaults.xsrfCookieName = "csrftoken";
axios_no_auth.defaults.xsrfHeaderName = "X-CSRFToken";

// Minimal CSRF helper for authless client
const addCsrfHeader = (config) => {
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  const token = getCookie("csrftoken");
  const method = (config.method || "").toLowerCase();
  if (token && ["post", "put", "patch", "delete"].includes(method)) {
    config.headers["X-CSRFToken"] = token;
  }
  // ensure no Authorization on authless client
  if (config.headers && "Authorization" in config.headers) {
    delete config.headers.Authorization;
  }
  return config;
};

// Attach CSRF only to authless client
axios_no_auth.interceptors.request.use(addCsrfHeader);

export default axios_instance;

// REMOVE queue-based handler (isRefreshing, refreshSubscribers) and replace with simple logic
axios_instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (!response || response.status !== 401) return Promise.reject(error);

    const originalRequest = config || {};
    const url = (originalRequest?.url || "").toString();

    // Skip auth endpoints, redirect directly
    if (url.includes("/account/token/") || url.includes("/account/logout/")) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      window.location.href = "/login";
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        window.location.href = "/login";
        return Promise.reject(error);
      }
      return axios_instance(originalRequest);
    } catch (e) {
      window.location.href = "/login";
      return Promise.reject(e);
    }
  }
);

// 🔄 Obnova access tokenu pomocí refresh cookie (no Authorization header)
export const refreshAccessToken = async () => {
  try {
    const res = await axios_no_auth.post(`/account/token/refresh/`, {});
    if (res?.data?.access) {
      axios_instance.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
    }
    return res.data;
  } catch (err) {
    console.error("Token refresh failed", err);
    // do not call logout here; the interceptor will handle redirect/cleanup
    return null;
  }
};
// ✅ Přihlášení (no Authorization header)
export const login = async (username, password) => {
  // ensure no stale Authorization header is present before login
  if (axios_instance.defaults.headers.common.Authorization) {
    delete axios_instance.defaults.headers.common.Authorization;
  }
  try {
    const response = await axios_no_auth.post(`/account/token/`, { username, password });
    if (response?.data?.access) {
      axios_instance.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
    }
    return response.data;
  } catch (err) {
    if (err.response) {
      console.log("Login error status:", err.response.status);
    } else if (err.request) {
      console.log("Login network error:", err.request);
    } else {
      console.log("Login setup error:", err.message);
    }
    throw err;
  }
};

// ❌ Odhlášení s CSRF tokenem
export const logout = async () => {
  try {
    const response = await axios_no_auth.post(
      "/account/logout/",
      {},
      {
        headers: {
          // CSRF header added by interceptor
        },
      }
    );
    // Clear header-based auth if it was set
    delete axios_instance.defaults.headers.common.Authorization;
    console.log(response.data);
    return response.data; // např. { detail: "Logout successful" }
  } catch (err) {
    console.error("Logout failed", err);
    throw err;
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
    if (err.response) {
      console.error("API Error:", {
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers,
      });
    } else if (err.request) {
      console.error("No response received:", err.request);
    } else {
      console.error("Request setup error:", err.message);
    }

    throw err;
  }
};

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