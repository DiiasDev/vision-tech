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

