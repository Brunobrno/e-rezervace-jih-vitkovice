//📡 Volání jakéhokoliv API (token se nastaví automaticky!)

import axios from "axios";
import API_URL from "../api/auth";

// Pokud máš chráněný endpoint např. `/user/profile/`
const response = await axios.get(`${API_URL}/user/profile/`);
console.log(response.data); // obsah profilu
