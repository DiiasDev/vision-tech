import { frappe } from "./frappeClient";
import { type ClienteTypes } from "../types/Clientes.types";

export async function criarCliente(data: ClienteTypes) {
  try {
    const response = await frappe.post("/resource/Clientes", data);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    throw error;
  }
}

export async function listarClientes() {
  try {
    const response = await frappe.get("/resource/Clientes", {
      params: {
        fields: JSON.stringify(["*"]),
      },
    });
    console.log("Data: ", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    throw error;
  }
}