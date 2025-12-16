export interface Fornecedor {
  name?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
  docstatus?: number;
  idx?: number;

  // Dados Gerais
  nome_fornecedor: string;
  tipo_fornecedor?: "Produtos" | "Serviços" | "Produtos e Serviços";
  empresa?: string;
  categoria_fornecedor?: "Tecnologia" | "Acessórios" | "Manutenção" | "Serviços Digitais" | "Outros";
  website?: string;
  foto?: string;

  // Identificação Fiscal
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  regime_tributario?: "Simples Nacional" | "Lucro Presumido" | "Lucro Real";

  // Contatos
  contato_principal?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;

  // Endereço
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;

  // Condições Comerciais
  prazo_pagamento?: number;
  forma_pagamento_padrao?: "Boleto" | "PIX" | "Cartão" | "Transferência";
  limite_credito?: number;
  desconto_padrao?: number;

  // Produtos / Serviços
  fornecimentos?: string;

  // Status e Controle
  status?: "Ativo" | "Inativo" | "Suspenso";
  ativo?: boolean | number;
  data_inicio_parceria?: string;

  // Observações
  observacoes?: string;
}

export interface FornecedorResponse {
  data: Fornecedor;
}

export interface FornecedoresListResponse {
  data: Fornecedor[];
}
