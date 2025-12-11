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

export async function atualizarCliente(name: string, data: Partial<ClienteTypes>) {
  try {
    const response = await frappe.put(`/resource/Clientes/${name}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
}

export async function deletarCliente(name: string) {
  try {
    const response = await frappe.delete(`/resource/Clientes/${name}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw error;
  }
}