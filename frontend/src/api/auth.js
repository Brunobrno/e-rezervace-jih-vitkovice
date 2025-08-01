import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Axios instance, můžeme používat místo globálního axios
const axios_instance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // potřebné pro cookies
});
axios_instance.defaults.xsrfCookieName = "csrftoken";
axios_instance.defaults.xsrfHeaderName = "X-CSRFToken";

export default axios_instance;

// 🔐 Axios response interceptor: automatická obnova při 401
axios_instance.interceptors.request.use((config) => {
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

  const csrfToken = getCookie("csrftoken");
  if (csrfToken && ["post", "put", "patch", "delete"].includes(config.method)) {
    config.headers["X-CSRFToken"] = csrfToken;
  }

  return config;
});



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


// ✅ Přihlášení
export const login = async (username, password) => {
  logout();
  try {
    const response = await axios_instance.post(`/account/token/`, { username, password });
    return response.data;
  } catch (err) {
    if (err.response) {
      // Server responded with a status code outside 2xx
      console.log('Login error status:', err.response.status);
    } else if (err.request) {
      // Request was made but no response received
      console.log('Login network error:', err.request);
    } else {
      // Something else happened
      console.log('Login setup error:', err.message);
    }
    throw err;
  }
};


// ❌ Odhlášení s CSRF tokenem
export const logout = async () => {
  try {
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

    const csrfToken = getCookie("csrftoken");

    const response = await axios_instance.post(
      "/account/logout/",
      {},
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      }
    );
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
      // Server odpověděl s kódem mimo rozsah 2xx
      console.error("API Error:", {
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers,
      });
    } else if (err.request) {
      // Request byl odeslán, ale nedošla odpověď
      console.error("No response received:", err.request);
    } else {
      // Něco jiného se pokazilo při sestavování requestu
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