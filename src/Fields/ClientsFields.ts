export const clienteFields = [
  // Informações Básicas
  { fieldname: "nome", label: "Nome Completo / Razão Social", fieldtype: "Data", required: true, section: "Informações Básicas" },
  {
    fieldname: "tipo_cliente",
    label: "Tipo de Cliente",
    fieldtype: "Select",
    options: "PF\nPJ",
    required: true,
    section: "Informações Básicas"
  },
  { fieldname: "cpf", label: "CPF", fieldtype: "Data", section: "Informações Básicas", mandatoryDependsOn: "eval:doc.tipo_cliente=='PF'" },
  { fieldname: "cnpj", label: "CNPJ", fieldtype: "Data", section: "Informações Básicas", mandatoryDependsOn: "eval:doc.tipo_cliente=='PJ'" },
  { fieldname: "ativo", label: "Ativo", fieldtype: "Check", section: "Informações Básicas" },
  { fieldname: "observacoes", label: "Observações", fieldtype: "Small Text", section: "Informações Básicas" },
  
  // Contatos
  { fieldname: "telefone", label: "Telefone", fieldtype: "Data", required: true, section: "Contatos" },
  { fieldname: "whatsapp", label: "WhatsApp", fieldtype: "Data", section: "Contatos" },
  { fieldname: "email", label: "E-mail", fieldtype: "Data", required: true, section: "Contatos" },
  
  // Endereço
  { fieldname: "cep", label: "CEP", fieldtype: "Data", section: "Endereço" },
  {
    fieldname: "tipo_endereco",
    label: "Tipo de Endereço",
    fieldtype: "Select",
    options: "Principal\nCobrança\nEntrega",
    section: "Endereço"
  },
  { fieldname: "logradouro", label: "Logradouro", fieldtype: "Data", section: "Endereço" },
  { fieldname: "numero", label: "Número", fieldtype: "Data", section: "Endereço" },
  { fieldname: "complemento", label: "Complemento", fieldtype: "Data", section: "Endereço" },
  { fieldname: "bairro", label: "Bairro", fieldtype: "Data", section: "Endereço" },
  { fieldname: "cidade", label: "Cidade", fieldtype: "Data", section: "Endereço" },
  { fieldname: "estado", label: "Estado", fieldtype: "Data", section: "Endereço" },
  { fieldname: "referencia", label: "Referência", fieldtype: "Data", section: "Endereço" },
];