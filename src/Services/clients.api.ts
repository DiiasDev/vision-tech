import { frappe } from "./frappeClient";

export interface ClientePayload {
  // Informações Básicas
  nome: string;
  tipo_cliente: "PF" | "PJ";
  cpf?: string;
  cnpj?: string;
  ativo?: number;
  observacoes?: string;
  
  // Contatos
  telefone?: string;
  whatsapp?: string;
  email?: string;
  
  // Endereço
  cep?: string;
  tipo_endereco?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  referencia?: string;
}

export async function criarCliente(data: ClientePayload) {
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
        fields: JSON.stringify([
          "name",
          "nome",
          "email",
          "telefone",
          "whatsapp",
          "ativo",
          "creation",
          "logradouro",
          "numero",
          "bairro",
          "cidade",
          "estado",
          "tipo_cliente",
          "cpf",
          "cnpj"
        ])
      }
    });
    console.log("Dados: ", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    throw error;
  }
}

export async function obterCliente(nome: string) {
  try {
    const response = await frappe.get(`/resource/Clientes/${nome}`);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao obter cliente:", error);
    throw error;
  }
}

export async function atualizarCliente(nome: string, data: Partial<ClientePayload>) {
  try {
    const response = await frappe.put(`/resource/Clientes/${nome}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
}

export async function deletarCliente(nome: string) {
  try {
    await frappe.delete(`/resource/Clientes/${nome}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw error;
  }
}
