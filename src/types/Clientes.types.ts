export interface ClienteTypes {
  // Informações Básicas
  name?: string; // ID do documento no Frappe
  nome: string;
  tipo_cliente: "PF" | "PJ";
  cpf?: string;
  cnpj?: string;
  ativo?: number;
  observacoes?: string;
  creation?: string;
  
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