// ❌ Odhlášení:

import { logout } from "../api/auth";

logout();




//✅ Přihlášení uživatele:

import { login } from "../api/auth";

const success = await login("username", "password");
if (success) {
  console.log("Přihlášení úspěšné");
} else {
  alert("Chybné přihlášení");
}



// 👤 Získání přihlášeného uživatele:

import { getCurrentUser } from "../api/auth";

const user = await getCurrentUser();

if (user) {
  console.log("Přihlášený uživatel:", user);
} else {
  console.log("Nikdo není přihlášen");
}
// pokud dojde k 401, pokusí se obnovit token