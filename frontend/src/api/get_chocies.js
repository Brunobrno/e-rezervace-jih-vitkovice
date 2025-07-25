import { apiRequest } from "./auth";

/**
 * Načte enum hodnoty z OpenAPI schématu pro zadanou cestu, metodu a pole (např. category).
 *
 * @param {string} path - API cesta, např. "/api/service-tickets/"
 * @param {"get"|"post"|"patch"|"put"} method - HTTP metoda
 * @param {string} field - název pole v parametrech nebo requestu
 * @param {string} schemaUrl - URL JSON schématu, výchozí "/api/schema/?format=json"
 * @returns {Promise<Array<{ value: string, label: string }>>}
 */
export async function fetchEnumFromSchemaJson(
  path,
  method,
  field,
  schemaUrl = "/schema/?format=json"
) {
  try {
    const schema = await apiRequest("get", schemaUrl);

    const methodDef = schema.paths?.[path]?.[method];
    if (!methodDef) {
      throw new Error(`Metoda ${method.toUpperCase()} pro ${path} nebyla nalezena ve schématu.`);
    }

    // Hledáme ve "parameters" (např. GET query parametry)
    const param = methodDef.parameters?.find((p) => p.name === field);

    if (param?.schema?.enum) {
      return param.schema.enum.map((val) => ({
        value: val,
        label: val,
      }));
    }

    throw new Error(`Pole '${field}' neobsahuje enum`);
  } catch (error) {
    console.error("Chyba při načítání enum hodnot:", error);
    throw error;
  }
}
