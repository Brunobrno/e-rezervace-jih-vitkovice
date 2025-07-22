
/* PŘÍKLAD FETCH Z VEŘEJNÉHO API (v swaggeru to poznáte podle odemknutého zámečku) */

import API_URL from "../auth"; // musíš si importovat API_URL z auth.js

const response = await fetch(`${API_URL}/account/registration/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "exampleUser",
    email: "example@example.com",
    password: "tajneheslo123",
  }),
});

const data = await response.json();
console.log(data);







/*---------------PRO CHRÁNĚNÉ ENDPOINTY----------------*/ 

import { apiRequest } from "../auth"; // důležitý helper pro chráněné API

// ✅ GET – Načtení dat
const userData = await apiRequest("get", "/account/profile/");

// ✅ POST – Např. vytvoření nové rezervace
const newItem = await apiRequest("post", "/reservation/create/", {
  name: "Stánek s medem",
  location: "A5",
});

// ✅ PUT – Úplná aktualizace
const updatedItem = await apiRequest("put", "/reservation/42/", {
  name: "Upravený stánek",
  location: "B1",
});

// ✅ PATCH – Částečná aktualizace
const partiallyUpdated = await apiRequest("patch", "/reservation/42/", {
  location: "C3",
});

// ✅ DELETE – Smazání záznamu
await apiRequest("delete", "/reservation/42/");
