import { frappe } from "./frappeClient";
import { type Colaborador } from "../types/Colaboradores.types";

export async function criarColaborador(dados: Colaborador) {
  try {
    const { data } = await frappe.post("/resource/Colaboradores", dados);
    return data.data;
  } catch (error: any) {
    console.error("Erro ao criar colaborador...", error);
    throw error;
  }
}

export async function listarColaboradores(): Promise<Colaborador[]> {
  try {
    const { data } = await frappe.get("/resource/Colaboradores", {
      params: {
        fields: JSON.stringify([
          "name",
          "codigo_colaborador",
          "nome_completo",
          "cpf",
          "data_nascimento",
          "sexo",
          "estado_civil",
          "email",
          "telefone",
          "whatsapp",
          "endereco",
          "cargo",
          "tipo_colaborador",
          "area_atuacao",
          "habilidades",
          "status",
          "data_admissao",
          "tipo_contrato",
          "salario",
          "carga_horaria",
          "usuario_sistema",
          "pode_acessar_sistema",
          "observacoes",
          "creation",
          "modified",
          "owner",
          "modified_by"
        ]),
        limit_page_length: 999,
      },
    });
    return data.data || [];
  } catch (error: any) {
    console.error("Erro ao listar colaboradores:", error);
    throw error;
  }
}

export async function atualizarColaborador(name: string, dados: Colaborador) {
  try {
    const { data } = await frappe.put(`/resource/Colaboradores/${name}`, dados);
    return data.data;
  } catch (error: any) {
    console.error("Erro ao atualizar colaborador:", error);
    throw error;
  }
}

export async function deletarColaborador(name: string) {
  try {
    await frappe.delete(`/resource/Colaboradores/${name}`);
    return true;
  } catch (error: any) {
    console.error("Erro ao deletar colaborador:", error);
    throw error;
  }
}
