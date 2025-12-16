import {frappe} from "./frappeClient"
import { type Fornecedor } from "../types/Fornecedores.types";

export async function criarFornecedor(data: Fornecedor){
    try{
        const response = await frappe.post("/resource/Fornecedor", data);
        return response.data.data; 
    }catch(error: any){
        console.error("Erro ao cadastrar Fornecedor: ", error);
        throw error;
    }
}

export async function listarFornecedores(): Promise<Fornecedor[]> {
    try {
        const response = await frappe.get("/resource/Fornecedor", {
            params: {
                fields: JSON.stringify([
                    "name",
                    "nome_fornecedor",
                    "tipo_fornecedor",
                    "empresa",
                    "categoria_fornecedor",
                    "website",
                    "cnpj",
                    "inscricao_estadual",
                    "contato_principal",
                    "telefone",
                    "whatsapp",
                    "email",
                    "logradouro",
                    "numero",
                    "bairro",
                    "cidade",
                    "estado",
                    "cep",
                    "prazo_pagamento",
                    "forma_pagamento_padrao",
                    "limite_credito",
                    "fornecimentos",
                    "status",
                    "ativo",
                    "data_inicio_parceria",
                    "creation",
                    "modified"
                ]),
                limit_page_length: 0
            }
        });
        return response.data.data;
    } catch (error: any) {
        console.error("Erro ao listar fornecedores: ", error);
        throw error;
    }
}

export async function atualizarFornecedor(name: string, data: Fornecedor) {
    try {
        const response = await frappe.put(`/resource/Fornecedor/${name}`, data);
        return response.data.data;
    } catch (error: any) {
        console.error("Erro ao atualizar fornecedor: ", error);
        throw error;
    }
}

export async function deletarFornecedor(name: string) {
    try {
        const response = await frappe.delete(`/resource/Fornecedor/${name}`);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao deletar fornecedor: ", error);
        throw error;
    }
}

