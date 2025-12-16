export const fornecedoresFields = [
  // ===============================
  // DADOS GERAIS
  // ===============================
  {
    fieldname: "nome_fornecedor",
    label: "Nome do Fornecedor",
    fieldtype: "Data",
    required: true,
    section: "Dados Gerais"
  },
  {
    fieldname: "tipo_fornecedor",
    label: "Tipo de Fornecedor",
    fieldtype: "Select",
    options: ["Produtos", "Serviços", "Produtos e Serviços"],
    section: "Dados Gerais"
  },
  {
    fieldname: "empresa",
    label: "Razão Social",
    fieldtype: "Data",
    section: "Dados Gerais"
  },
  {
    fieldname: "categoria_fornecedor",
    label: "Categoria",
    fieldtype: "Select",
    options: ["Tecnologia", "Acessórios", "Manutenção", "Serviços Digitais", "Outros"],
    section: "Dados Gerais"
  },
  {
    fieldname: "website",
    label: "Website",
    fieldtype: "Data",
    section: "Dados Gerais"
  },
  {
    fieldname: "foto",
    label: "Foto do Fornecedor",
    fieldtype: "Attach Image",
    section: "Dados Gerais"
  },

  // ===============================
  // IDENTIFICAÇÃO FISCAL
  // ===============================
  {
    fieldname: "cnpj",
    label: "CNPJ",
    fieldtype: "Data",
    section: "Identificação Fiscal"
  },
  {
    fieldname: "inscricao_estadual",
    label: "Inscrição Estadual",
    fieldtype: "Data",
    section: "Identificação Fiscal"
  },
  {
    fieldname: "inscricao_municipal",
    label: "Inscrição Municipal",
    fieldtype: "Data",
    section: "Identificação Fiscal"
  },
  {
    fieldname: "regime_tributario",
    label: "Regime Tributário",
    fieldtype: "Select",
    options: ["Simples Nacional", "Lucro Presumido", "Lucro Real"],
    section: "Identificação Fiscal"
  },

  // ===============================
  // CONTATOS
  // ===============================
  {
    fieldname: "contato_principal",
    label: "Nome do Contato",
    fieldtype: "Data",
    section: "Contatos"
  },
  {
    fieldname: "telefone",
    label: "Telefone",
    fieldtype: "Data",
    section: "Contatos"
  },
  {
    fieldname: "whatsapp",
    label: "WhatsApp",
    fieldtype: "Data",
    section: "Contatos"
  },
  {
    fieldname: "email",
    label: "E-mail",
    fieldtype: "Data",
    section: "Contatos"
  },

  // ===============================
  // ENDEREÇO
  // ===============================
  {
    fieldname: "logradouro",
    label: "Logradouro",
    fieldtype: "Data",
    section: "Endereço"
  },
  {
    fieldname: "numero",
    label: "Número",
    fieldtype: "Data",
    section: "Endereço"
  },
  {
    fieldname: "bairro",
    label: "Bairro",
    fieldtype: "Data",
    section: "Endereço"
  },
  {
    fieldname: "cidade",
    label: "Cidade",
    fieldtype: "Data",
    section: "Endereço"
  },
  {
    fieldname: "estado",
    label: "Estado",
    fieldtype: "Data",
    section: "Endereço"
  },
  {
    fieldname: "cep",
    label: "CEP",
    fieldtype: "Data",
    section: "Endereço"
  },

  // ===============================
  // CONDIÇÕES COMERCIAIS
  // ===============================
  {
    fieldname: "prazo_pagamento",
    label: "Prazo de Pagamento (dias)",
    fieldtype: "Int",
    section: "Condições Comerciais"
  },
  {
    fieldname: "forma_pagamento_padrao",
    label: "Forma de Pagamento Padrão",
    fieldtype: "Select",
    options: ["Boleto", "PIX", "Cartão", "Transferência"],
    section: "Condições Comerciais"
  },
  {
    fieldname: "limite_credito",
    label: "Limite de Crédito",
    fieldtype: "Currency",
    section: "Condições Comerciais"
  },
  {
    fieldname: "desconto_padrao",
    label: "Desconto Padrão (%)",
    fieldtype: "Percent",
    section: "Condições Comerciais"
  },

  // ===============================
  // PRODUTOS / SERVIÇOS
  // ===============================
  {
    fieldname: "fornecimentos",
    label: "Produtos ou Serviços Fornecidos",
    fieldtype: "Small Text",
    section: "Produtos / Serviços"
  },

  // ===============================
  // STATUS E CONTROLE
  // ===============================
  {
    fieldname: "status",
    label: "Status",
    fieldtype: "Select",
    options: ["Ativo", "Inativo", "Suspenso"],
    section: "Status"
  },
  {
    fieldname: "ativo",
    label: "Fornecedor Ativo",
    fieldtype: "Check",
    section: "Status"
  },
  {
    fieldname: "data_inicio_parceria",
    label: "Início da Parceria",
    fieldtype: "Date",
    section: "Status"
  },

  // ===============================
  // OBSERVAÇÕES
  // ===============================
  {
    fieldname: "observacoes",
    label: "Observações Internas",
    fieldtype: "Long Text",
    section: "Observações"
  }
];
