export const colaboradoresFields = [
  // =========================
  // Identificação
  // =========================
  {
    fieldname: "status",
    label: "Status",
    fieldtype: "Select",
    required: true,
    section: "Identificação",
    options: ["Ativo", "Inativo", "Afastado"]
  },

  // =========================
  // Dados Pessoais
  // =========================
  {
    fieldname: "nome_completo",
    label: "Nome Completo",
    fieldtype: "Data",
    required: true,
    section: "Dados Pessoais"
  },
  {
    fieldname: "cpf",
    label: "CPF",
    fieldtype: "Data",
    required: false,
    section: "Dados Pessoais"
  },
  {
    fieldname: "data_nascimento",
    label: "Data de Nascimento",
    fieldtype: "Date",
    required: false,
    section: "Dados Pessoais"
  },
  {
    fieldname: "sexo",
    label: "Sexo",
    fieldtype: "Select",
    required: false,
    section: "Dados Pessoais",
    options: ["Masculino", "Feminino", "Outro"]
  },
  {
    fieldname: "estado_civil",
    label: "Estado Civil",
    fieldtype: "Select",
    required: false,
    section: "Dados Pessoais",
    options: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"]
  },

  // =========================
  // Contato
  // =========================
  {
    fieldname: "telefone",
    label: "Telefone",
    fieldtype: "Data",
    required: false,
    section: "Contato"
  },
  {
    fieldname: "whatsapp",
    label: "WhatsApp",
    fieldtype: "Data",
    required: false,
    section: "Contato"
  },
  {
    fieldname: "email",
    label: "E-mail",
    fieldtype: "Data",
    required: false,
    section: "Contato"
  },
  {
    fieldname: "endereco",
    label: "Endereço",
    fieldtype: "Small Text",
    required: false,
    section: "Contato"
  },

  // =========================
  // Cargo & Função
  // =========================
  {
    fieldname: "cargo",
    label: "Cargo",
    fieldtype: "Select",
    required: true,
    section: "Cargo & Função",
    options: ["Desenvolvedor", "Técnico de Manutenção", "Atendimento", "Vendas", "Administrativo", "Gerente", "Outro"]
  },
  {
    fieldname: "tipo_colaborador",
    label: "Tipo de Colaborador",
    fieldtype: "Select",
    required: true,
    section: "Cargo & Função",
    options: ["CLT", "PJ", "Freelancer", "Parceiro"]
  },
  {
    fieldname: "area_atuacao",
    label: "Área de Atuação",
    fieldtype: "Select",
    required: false,
    section: "Cargo & Função",
    options: ["Web", "Chatbot", "Manutenção", "Vendas", "Suporte"]
  },
  {
    fieldname: "habilidades",
    label: "Habilidades",
    fieldtype: "Small Text",
    required: false,
    section: "Cargo & Função"
  },

  // =========================
  // Dados Profissionais
  // =========================
  {
    fieldname: "data_admissao",
    label: "Data de Admissão",
    fieldtype: "Date",
    required: false,
    section: "Dados Profissionais"
  },
  {
    fieldname: "tipo_contrato",
    label: "Tipo de Contrato",
    fieldtype: "Select",
    required: false,
    section: "Dados Profissionais",
    options: ["Integral", "Meio Período", "Sob Demanda"]
  },
  {
    fieldname: "salario",
    label: "Salário / Valor Base",
    fieldtype: "Currency",
    required: false,
    section: "Dados Profissionais"
  },
  {
    fieldname: "carga_horaria",
    label: "Carga Horária",
    fieldtype: "Data",
    required: false,
    section: "Dados Profissionais"
  },

  // =========================
  // Acesso ao Sistema
  // =========================
  {
    fieldname: "usuario_sistema",
    label: "Usuário do Sistema",
    fieldtype: "Link",
    required: false,
    section: "Acesso ao Sistema"
  },
  {
    fieldname: "pode_acessar_sistema",
    label: "Pode acessar o sistema?",
    fieldtype: "Check",
    required: false,
    section: "Acesso ao Sistema"
  },

  // =========================
  // Observações
  // =========================
  {
    fieldname: "observacoes",
    label: "Observações Gerais",
    fieldtype: "Long Text",
    required: false,
    section: "Observações"
  }
]
