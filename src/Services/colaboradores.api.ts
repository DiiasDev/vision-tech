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


export async function validarColaborador(username: string, password: string) {
  try {
    const colaboradores = await listarColaboradores();
    
    // Senha padrão para todos os colaboradores
    const SENHA_PADRAO = "123";
    
    // Busca o colaborador pelo email ou nome de usuário (independente das permissões)
    const colaboradorEncontrado = colaboradores.find(
      col => 
        col.email?.toLowerCase() === username.toLowerCase() || 
        col.usuario_sistema?.toLowerCase() === username.toLowerCase() ||
        col.nome_completo?.toLowerCase() === username.toLowerCase()
    );

    if (!colaboradorEncontrado) {
      return {
        success: false,
        message: "Usuário não encontrado"
      };
    }

    // Verifica se o colaborador está ativo
    if (colaboradorEncontrado.status !== "Ativo") {
      return {
        success: false,
        message: "Colaborador inativo. Entre em contato com o administrador."
      };
    }

    // Verifica se tem permissão de acesso ao sistema
    if (colaboradorEncontrado.pode_acessar_sistema !== 1) {
      return {
        success: false,
        message: "Acesso ao sistema não autorizado. Entre em contato com o administrador."
      };
    }

    // Valida a senha padrão
    if (password !== SENHA_PADRAO) {
      return {
        success: false,
        message: "Senha incorreta"
      };
    }

    // Retorna os dados do colaborador validado
    return {
      success: true,
      colaborador: {
        name: colaboradorEncontrado.name,
        username: colaboradorEncontrado.usuario_sistema || colaboradorEncontrado.email,
        fullName: colaboradorEncontrado.nome_completo,
        email: colaboradorEncontrado.email,
        cargo: colaboradorEncontrado.cargo,
        codigo: colaboradorEncontrado.codigo_colaborador
      }
    };
  } catch (error: any) {
    console.error("Erro ao validar colaborador:", error);
    return {
      success: false,
      message: "Erro ao validar credenciais"
    };
  }
}