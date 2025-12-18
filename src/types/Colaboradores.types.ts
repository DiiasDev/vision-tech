export interface Colaborador {
  // =========================
  // Identificação
  // =========================
  name?: string; // ID do documento no Frappe
  codigo_colaborador?: string;
  status: "Ativo" | "Inativo" | "Afastado";

  // =========================
  // Dados Pessoais
  // =========================
  nome_completo: string;
  cpf?: string;
  data_nascimento?: string; // YYYY-MM-DD
  sexo?: "Masculino" | "Feminino" | "Outro";
  estado_civil?: "Solteiro(a)" | "Casado(a)" | "Divorciado(a)" | "Viúvo(a)";

  // =========================
  // Contato
  // =========================
  telefone?: string;
  whatsapp?: string;
  email?: string;
  endereco?: string;

  // =========================
  // Cargo & Função
  // =========================
  cargo:
    | "Desenvolvedor"
    | "Técnico de Manutenção"
    | "Atendimento"
    | "Vendas"
    | "Administrativo"
    | "Gerente"
    | "Outro";

  tipo_colaborador: "CLT" | "PJ" | "Freelancer" | "Parceiro";
  area_atuacao?: "Web" | "Chatbot" | "Manutenção" | "Vendas" | "Suporte";
  habilidades?: string;

  // =========================
  // Dados Profissionais
  // =========================
  data_admissao?: string; // YYYY-MM-DD
  tipo_contrato?: "Integral" | "Meio Período" | "Sob Demanda";
  salario?: number;
  carga_horaria?: string;

  // =========================
  // Acesso ao Sistema
  // =========================
  usuario_sistema?: string; // link para User (email ou name)
  pode_acessar_sistema?: 0 | 1; // padrão Frappe

  // =========================
  // Observações
  // =========================
  observacoes?: string;

  // =========================
  // Metadados Frappe (opcional)
  // =========================
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
}
