//✅ Přihlášení uživatele:

import { login } from "../api/auth";

const success = await login("username", "password");
if (success) {
  console.log("Přihlášení úspěšné");
} else {
  alert("Chybné přihlášení");
}
