// src/api/frappeClient.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_SECRET = import.meta.env.VITE_API_SECRET;

export const frappe = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `token ${API_KEY}:${API_SECRET}`,
  },
});

// Intercepta erros automaticamente (apenas para erros críticos)
frappe.interceptors.response.use(
  (response) => response,
  (error) => {
    // Loga apenas erros que não sejam 404 ou 417 (endpoints não implementados)
    if (error.response?.status !== 404 && error.response?.status !== 417) {
      console.error("Erro na API do Frappe:", error.response?.data || error.message);
    }
    throw error;
  }
);

// Verifica se o backend está online
export async function verificarStatusBackend(): Promise<boolean> {
  try {
    await frappe.get("/method/ping");
    return true;
  } catch (error) {
    return false;
  }
}
