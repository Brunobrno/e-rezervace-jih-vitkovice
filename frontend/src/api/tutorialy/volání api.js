
/* PŘÍKLAD FETCH Z VEŘEJNÉHO API (v swaggeru to poznáte podle odemknutého zámečku) */

import API_URL from "../auth"; // musíš si importovat API_URL z auth.js

const response = await fetch(`${API_URL}/account/registration/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nejakeData: "nejakeData",
  }),
})






/*---------------PRO CHRÁNĚNÉ ENDPOINTY----------------*/ 

import { apiRequest } from "../auth"; // musíš si importovat apiRequest z auth.js!!!

// 🔄 Obecná funkce pro volání API s různými metodami
// GET
const data = await apiRequest("get", "/nějaká/url/adresa/");

// POST
const data1 = await apiRequest("post", "/nějaká/url/adresa/", { nejakeData: "nejakeData"});

// PUT
const data2 = await apiRequest("put", `/nějaká/url/adresa/`, { nejakeData: "nejakeData" });

// PATCH (částečná aktualizace)
const data3 = await apiRequest("patch", `/nějaká/url/adresa/`, { nejakeData: "nejakeData" });

// DELETE
await apiRequest("delete", `/nějaká/url/adresa/{ídečko xD}`);

