export type BudgetStatus = "draft" | "sent" | "negotiation" | "approved" | "rejected" | "expired"

export type BudgetPriority = "low" | "medium" | "high"

export type BudgetRiskLevel = "low" | "medium" | "high"

export type BudgetInteractionChannel = "email" | "call" | "meeting" | "whatsapp" | "proposal"

export type BudgetClient = {
  id: string
  name: string
  segment: string
  document: string
  city: string
  state: string
  contactName: string
  contactRole: string
  email: string
  phone: string
}

export type BudgetItem = {
  id: string
  productId?: string | null
  code?: string | null
  description: string
  category: string
  quantity: number
  unitPrice: number
  discount: number
  internalCost: number
  estimatedHours: number
  deliveryWindow: string
}

export type BudgetInteraction = {
  id: string
  date: string
  channel: BudgetInteractionChannel
  summary: string
  author: string
}

export type BudgetRisk = {
  id: string
  title: string
  level: BudgetRiskLevel
  impact: string
  mitigation: string
}

export type BudgetNextStep = {
  id: string
  dueDate: string
  action: string
  owner: string
  objective: string
}

export type Budget = {
  id: string
  code: string
  title: string
  status: BudgetStatus
  priority: BudgetPriority
  owner: string
  createdAt: string
  updatedAt: string
  validUntil: string
  approvalDate?: string
  expectedCloseDate: string
  paymentTerms: string
  deliveryTerm: string
  slaSummary: string
  scopeSummary: string
  assumptions: string[]
  exclusions: string[]
  client: BudgetClient
  serviceId?: string | null
  serviceCode?: string | null
  serviceName?: string | null
  serviceCategory?: string | null
  serviceBillingModel?: string | null
  serviceDescription?: string | null
  serviceEstimatedDuration?: string | null
  serviceResponsible?: string | null
  serviceStatus?: string | null
  productsTotalAmount?: number
  productsCostAmount?: number
  serviceTotalAmount?: number
  serviceCostAmount?: number
  budgetDiscount?: number
  budgetTotalCostAmount?: number
  budgetTotalAmount?: number
  budgetProfitPercent?: number
  items: BudgetItem[]
  interactions: BudgetInteraction[]
  risks: BudgetRisk[]
  nextSteps: BudgetNextStep[]
  attachments: string[]
}

export type BudgetFinancials = {
  grossTotal: number
  discountTotal: number
  netTotal: number
  costTotal: number
  marginValue: number
  marginPercent: number
}

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

function toDate(value: string) {
  const match = DATE_ONLY_REGEX.exec(value)
  if (match) {
    const year = Number.parseInt(match[1], 10)
    const month = Number.parseInt(match[2], 10)
    const day = Number.parseInt(match[3], 10)
    return new Date(year, month - 1, day, 12, 0, 0)
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return new Date()
  return parsed
}

export function formatBudgetDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toDate(value))
}

export function formatBudgetDateLong(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(toDate(value))
}

export function daysUntilDate(value: string) {
  const base = new Date()
  const today = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0, 0)
  const target = toDate(value)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getBudgetItemGrossTotal(item: BudgetItem) {
  return item.quantity * item.unitPrice
}

export function getBudgetItemNetTotal(item: BudgetItem) {
  return getBudgetItemGrossTotal(item) - item.discount
}

export function getBudgetItemCostTotal(item: BudgetItem) {
  return item.quantity * item.internalCost
}

export function getBudgetItemMarginPercent(item: BudgetItem) {
  const netTotal = getBudgetItemNetTotal(item)
  const marginValue = netTotal - getBudgetItemCostTotal(item)
  if (netTotal <= 0) return 0
  return (marginValue / netTotal) * 100
}

export function calculateBudgetFinancials(budget: Budget): BudgetFinancials {
  const grossTotal = budget.items.reduce((acc, item) => acc + getBudgetItemGrossTotal(item), 0)
  const discountTotal = budget.items.reduce((acc, item) => acc + item.discount, 0)
  const netTotal = budget.items.reduce((acc, item) => acc + getBudgetItemNetTotal(item), 0)
  const costTotal = budget.items.reduce((acc, item) => acc + getBudgetItemCostTotal(item), 0)
  const marginValue = netTotal - costTotal
  const marginPercent = netTotal > 0 ? (marginValue / netTotal) * 100 : 0

  return {
    grossTotal,
    discountTotal,
    netTotal,
    costTotal,
    marginValue,
    marginPercent,
  }
}

export function budgetStatusLabel(status: BudgetStatus) {
  if (status === "draft") return "Rascunho"
  if (status === "sent") return "Enviado"
  if (status === "negotiation") return "Em negociacao"
  if (status === "approved") return "Aprovado"
  if (status === "rejected") return "Perdido"
  return "Expirado"
}

export function budgetStatusTone(status: BudgetStatus) {
  if (status === "draft") return "border-zinc-300/60 bg-zinc-100/75 text-zinc-700"
  if (status === "sent") return "border-sky-300/60 bg-sky-100/75 text-sky-700"
  if (status === "negotiation") return "border-amber-300/60 bg-amber-100/80 text-amber-700"
  if (status === "approved") return "border-emerald-300/60 bg-emerald-100/75 text-emerald-700"
  if (status === "rejected") return "border-rose-300/60 bg-rose-100/75 text-rose-700"
  return "border-slate-300/60 bg-slate-100/80 text-slate-700"
}

export function budgetPriorityLabel(priority: BudgetPriority) {
  if (priority === "high") return "Alta"
  if (priority === "medium") return "Media"
  return "Baixa"
}

export function budgetPriorityTone(priority: BudgetPriority) {
  if (priority === "high") return "border-rose-300/70 bg-rose-100/80 text-rose-700"
  if (priority === "medium") return "border-amber-300/70 bg-amber-100/75 text-amber-700"
  return "border-emerald-300/70 bg-emerald-100/75 text-emerald-700"
}

export function budgetRiskLevelLabel(level: BudgetRiskLevel) {
  if (level === "high") return "Alto"
  if (level === "medium") return "Medio"
  return "Baixo"
}

export function budgetRiskLevelTone(level: BudgetRiskLevel) {
  if (level === "high") return "border-rose-300/70 bg-rose-100/80 text-rose-700"
  if (level === "medium") return "border-amber-300/70 bg-amber-100/80 text-amber-700"
  return "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"
}

export function budgetChannelLabel(channel: BudgetInteractionChannel) {
  if (channel === "email") return "E-mail"
  if (channel === "call") return "Ligacao"
  if (channel === "meeting") return "Reuniao"
  if (channel === "whatsapp") return "WhatsApp"
  return "Proposta"
}

export function isBudgetOpen(status: BudgetStatus) {
  return status === "draft" || status === "sent" || status === "negotiation"
}

export function buildBudgetRecommendations(budget: Budget) {
  const financials = calculateBudgetFinancials(budget)
  const remainingDays = daysUntilDate(budget.validUntil)
  const recommendations: string[] = []

  if (financials.marginPercent < 20) {
    recommendations.push("Margem abaixo de 20%. Revisar composicao de custos e descontos antes da aprovacao final.")
  }

  if (remainingDays <= 5 && budget.status !== "approved" && budget.status !== "rejected") {
    recommendations.push("Validade proxima do vencimento. Antecipar contato para renovar proposta e evitar retrabalho.")
  }

  if (budget.nextSteps.length === 0) {
    recommendations.push("Nao ha proximas acoes cadastradas. Defina ao menos um follow-up para manter o ciclo ativo.")
  }

  if (recommendations.length === 0) {
    recommendations.push("Cenario saudavel. Mantenha cadencia comercial e acompanhe aprovacao com decisor principal.")
  }

  return recommendations
}

export const budgetMockData: Budget[] = [
  {
    id: "bud-001",
    code: "ORC-0001",
    title: "Modernizacao da seguranca de rede e endpoint",
    status: "negotiation",
    priority: "high",
    owner: "Marina Lopes",
    createdAt: "2026-03-02",
    updatedAt: "2026-03-15",
    validUntil: "2026-03-25",
    expectedCloseDate: "2026-03-22",
    paymentTerms: "40% na assinatura, 30% no kickoff, 30% na entrega final",
    deliveryTerm: "Implantacao em ate 45 dias apos aceite comercial",
    slaSummary: "Atendimento 8x5 com resposta em ate 4h para incidentes criticos",
    scopeSummary:
      "Projeto para consolidar firewall, protecao de endpoint e processo de resposta a incidentes com treinamento da equipe interna.",
    assumptions: [
      "Cliente disponibiliza equipe de infraestrutura no horario de implantacao.",
      "Acesso remoto e VPN liberados durante toda a fase de configuracao.",
      "Inventario de endpoints atualizado antes do kickoff.",
    ],
    exclusions: [
      "Nao inclui renovacao de hardware legado fora da arquitetura proposta.",
      "Nao contempla atendimento 24x7.",
    ],
    client: {
      id: "cli-203",
      name: "Industria Delta Sul",
      segment: "Industria metalurgica",
      document: "13245678000190",
      city: "Joinville",
      state: "SC",
      contactName: "Carlos Henrique Prado",
      contactRole: "Gerente de TI",
      email: "carlos.prado@deltasul.com.br",
      phone: "47998541263",
    },
    items: [
      {
        id: "bud-001-item-1",
        description: "Implantacao de firewall gerenciado e hardening",
        category: "Projeto",
        quantity: 1,
        unitPrice: 14500,
        discount: 500,
        internalCost: 9100,
        estimatedHours: 36,
        deliveryWindow: "Semana 1 a 3",
      },
      {
        id: "bud-001-item-2",
        description: "Licencas endpoint protection (180 dispositivos)",
        category: "Licenca",
        quantity: 180,
        unitPrice: 32,
        discount: 0,
        internalCost: 21,
        estimatedHours: 8,
        deliveryWindow: "Semana 2",
      },
      {
        id: "bud-001-item-3",
        description: "Treinamento SOC e plano de resposta a incidentes",
        category: "Servico",
        quantity: 8,
        unitPrice: 380,
        discount: 120,
        internalCost: 210,
        estimatedHours: 8,
        deliveryWindow: "Semana 4",
      },
    ],
    interactions: [
      {
        id: "bud-001-int-1",
        date: "2026-03-03T10:15:00",
        channel: "meeting",
        summary: "Kickoff comercial com levantamento de dores e metas de seguranca.",
        author: "Marina Lopes",
      },
      {
        id: "bud-001-int-2",
        date: "2026-03-08T15:40:00",
        channel: "proposal",
        summary: "Primeira versao da proposta enviada para validacao tecnica.",
        author: "Marina Lopes",
      },
      {
        id: "bud-001-int-3",
        date: "2026-03-14T11:00:00",
        channel: "call",
        summary: "Cliente solicitou ajuste no parcelamento e reforco de SLA.",
        author: "Andre Pires",
      },
    ],
    risks: [
      {
        id: "bud-001-risk-1",
        title: "Aprovacao depende da diretoria financeira",
        level: "high",
        impact: "Pode estender o ciclo comercial em ate 20 dias.",
        mitigation: "Agendar reuniao com CFO para defender TCO e plano de ROI em 12 meses.",
      },
      {
        id: "bud-001-risk-2",
        title: "Ambiente de endpoints sem padrao",
        level: "medium",
        impact: "Risco de retrabalho no rollout inicial.",
        mitigation: "Executar pre-assessment tecnico antes da fase de implantacao.",
      },
    ],
    nextSteps: [
      {
        id: "bud-001-next-1",
        dueDate: "2026-03-19",
        action: "Enviar simulado de retorno financeiro",
        owner: "Marina Lopes",
        objective: "Reforcar viabilidade para comite financeiro",
      },
      {
        id: "bud-001-next-2",
        dueDate: "2026-03-21",
        action: "Reuniao de alinhamento final com decisores",
        owner: "Carlos Prado",
        objective: "Concluir negociacao de clausulas comerciais",
      },
    ],
    attachments: [
      "Proposta_tecnica_v3.pdf",
      "Planilha_TCO_12m.xlsx",
      "Escopo_implantacao_rede.docx",
    ],
  },
  {
    id: "bud-002",
    code: "ORC-0004",
    title: "Central de atendimento omnichannel com BI",
    status: "sent",
    priority: "medium",
    owner: "Andre Pires",
    createdAt: "2026-02-27",
    updatedAt: "2026-03-12",
    validUntil: "2026-03-24",
    expectedCloseDate: "2026-03-28",
    paymentTerms: "50% no aceite, 50% em 30 dias",
    deliveryTerm: "Go-live em ate 30 dias",
    slaSummary: "Suporte 12x5 com atendimento prioritario",
    scopeSummary:
      "Implementacao de plataforma de atendimento omnichannel, dashboard de performance e automacoes de fila.",
    assumptions: [
      "Cliente define equipe de validacao com poder de aprovacao.",
      "Integracoes de telefonia e CRM com acesso liberado.",
    ],
    exclusions: [
      "Nao inclui customizacao de app mobile proprio.",
      "Nao contempla migracao historica acima de 12 meses.",
    ],
    client: {
      id: "cli-144",
      name: "VitaClin Rede Medica",
      segment: "Saude",
      document: "54233678000144",
      city: "Curitiba",
      state: "PR",
      contactName: "Fernanda Rocha",
      contactRole: "Diretora de Operacoes",
      email: "fernanda.rocha@vitaclin.com.br",
      phone: "41996122108",
    },
    items: [
      {
        id: "bud-002-item-1",
        description: "Licenca anual da plataforma omnichannel",
        category: "Licenca",
        quantity: 1,
        unitPrice: 18500,
        discount: 1250,
        internalCost: 11200,
        estimatedHours: 10,
        deliveryWindow: "Semana 1",
      },
      {
        id: "bud-002-item-2",
        description: "Setup inicial de fluxos e filas",
        category: "Projeto",
        quantity: 1,
        unitPrice: 6900,
        discount: 0,
        internalCost: 3400,
        estimatedHours: 32,
        deliveryWindow: "Semana 1 a 2",
      },
      {
        id: "bud-002-item-3",
        description: "Pacote BI com 6 dashboards executivos",
        category: "Servico",
        quantity: 1,
        unitPrice: 7400,
        discount: 500,
        internalCost: 3900,
        estimatedHours: 22,
        deliveryWindow: "Semana 3 a 4",
      },
    ],
    interactions: [
      {
        id: "bud-002-int-1",
        date: "2026-03-01T09:00:00",
        channel: "meeting",
        summary: "Apresentacao da arquitetura proposta ao board operacional.",
        author: "Andre Pires",
      },
      {
        id: "bud-002-int-2",
        date: "2026-03-12T16:20:00",
        channel: "email",
        summary: "Envio da proposta final com anexos de integracao.",
        author: "Andre Pires",
      },
    ],
    risks: [
      {
        id: "bud-002-risk-1",
        title: "Conflito de agenda para treinamento dos supervisores",
        level: "medium",
        impact: "Pode atrasar go-live em ate 1 semana.",
        mitigation: "Reservar duas turmas com datas alternativas.",
      },
    ],
    nextSteps: [
      {
        id: "bud-002-next-1",
        dueDate: "2026-03-20",
        action: "Validar compliance de dados e LGPD",
        owner: "Time juridico VitaClin",
        objective: "Liberar assinatura do contrato",
      },
    ],
    attachments: ["Proposta_omnichannel_v2.pdf", "Plano_treinamento_supervisores.pdf"],
  },
  {
    id: "bud-003",
    code: "ORC-0006",
    title: "Contrato recorrente de suporte NOC",
    status: "approved",
    priority: "medium",
    owner: "Marina Lopes",
    createdAt: "2026-01-18",
    updatedAt: "2026-02-03",
    validUntil: "2026-02-10",
    expectedCloseDate: "2026-02-04",
    paymentTerms: "Mensalidade fixa com reajuste anual",
    deliveryTerm: "Inicio da operacao em ate 7 dias",
    slaSummary: "Atendimento 24x7 com escala dedicada",
    scopeSummary:
      "Monitoramento NOC completo com acompanhamento de incidentes, alertas proativos e comite mensal de melhoria.",
    assumptions: [
      "Cliente libera acessos SNMP e logs de rede.",
      "Abertura de chamados centralizada via portal unico.",
    ],
    exclusions: ["Nao inclui aquisicao de novos equipamentos de rede."],
    client: {
      id: "cli-075",
      name: "Rede Max Atacado",
      segment: "Varejo",
      document: "66745321000100",
      city: "Goiania",
      state: "GO",
      contactName: "Daniel Matos",
      contactRole: "Head de Infraestrutura",
      email: "daniel.matos@redemax.com.br",
      phone: "62998341220",
    },
    items: [
      {
        id: "bud-003-item-1",
        description: "Servico mensal NOC 24x7",
        category: "Recorrente",
        quantity: 12,
        unitPrice: 6900,
        discount: 3600,
        internalCost: 4100,
        estimatedHours: 72,
        deliveryWindow: "Mensal",
      },
      {
        id: "bud-003-item-2",
        description: "Comite de performance mensal",
        category: "Servico",
        quantity: 12,
        unitPrice: 980,
        discount: 0,
        internalCost: 500,
        estimatedHours: 12,
        deliveryWindow: "Mensal",
      },
    ],
    interactions: [
      {
        id: "bud-003-int-1",
        date: "2026-01-20T14:00:00",
        channel: "proposal",
        summary: "Envio de proposta anual com opcoes de SLA.",
        author: "Marina Lopes",
      },
      {
        id: "bud-003-int-2",
        date: "2026-02-03T10:30:00",
        channel: "meeting",
        summary: "Aprovacao final em comite e assinatura digital.",
        author: "Daniel Matos",
      },
    ],
    risks: [
      {
        id: "bud-003-risk-1",
        title: "Rotina de escalonamento ainda em ajuste",
        level: "low",
        impact: "Sem impacto comercial relevante.",
        mitigation: "Ajuste continuo no primeiro ciclo mensal.",
      },
    ],
    nextSteps: [
      {
        id: "bud-003-next-1",
        dueDate: "2026-03-20",
        action: "Revisar indicadores do primeiro mes",
        owner: "Operacoes Byncode",
        objective: "Confirmar aderencia ao SLA contratado",
      },
    ],
    attachments: ["Contrato_NOC_redeMax.pdf", "Plano_transicao_operacional.xlsx"],
  },
  {
    id: "bud-004",
    code: "ORC-0008",
    title: "Plataforma de backup em nuvem multirregional",
    status: "rejected",
    priority: "high",
    owner: "Luan Araujo",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-26",
    validUntil: "2026-03-05",
    expectedCloseDate: "2026-02-24",
    paymentTerms: "Anual antecipado",
    deliveryTerm: "Ativacao em 20 dias",
    slaSummary: "Suporte 24x7 para restauracao critica",
    scopeSummary:
      "Estruturacao de backup em nuvem com retencao de 5 anos e plano de contingencia para dados criticos.",
    assumptions: ["Cliente manteria contrato minimo de 24 meses."],
    exclusions: ["Nao inclui licenciamento Microsoft 365."],
    client: {
      id: "cli-088",
      name: "Grupo Horizonte Educacao",
      segment: "Educacao",
      document: "09545321000110",
      city: "Belo Horizonte",
      state: "MG",
      contactName: "Juliana Gama",
      contactRole: "Gerente de Tecnologia",
      email: "juliana.gama@horizonteedu.com.br",
      phone: "31997751234",
    },
    items: [
      {
        id: "bud-004-item-1",
        description: "Licenca backup cloud enterprise",
        category: "Licenca",
        quantity: 1,
        unitPrice: 28600,
        discount: 0,
        internalCost: 21000,
        estimatedHours: 10,
        deliveryWindow: "Semana 1",
      },
      {
        id: "bud-004-item-2",
        description: "Projeto de migracao inicial",
        category: "Projeto",
        quantity: 1,
        unitPrice: 9200,
        discount: 700,
        internalCost: 6200,
        estimatedHours: 28,
        deliveryWindow: "Semana 2 a 3",
      },
    ],
    interactions: [
      {
        id: "bud-004-int-1",
        date: "2026-02-24T17:10:00",
        channel: "email",
        summary: "Cliente informou optacao por fornecedor com proposta de menor valor.",
        author: "Luan Araujo",
      },
    ],
    risks: [
      {
        id: "bud-004-risk-1",
        title: "Sensibilidade alta a preco",
        level: "high",
        impact: "Perda de competitividade sem flexibilizacao comercial.",
        mitigation: "Criar versao enxuta com fases e opcional de expansao.",
      },
    ],
    nextSteps: [
      {
        id: "bud-004-next-1",
        dueDate: "2026-04-05",
        action: "Reabrir conversa para renovacao de storage",
        owner: "Luan Araujo",
        objective: "Manter relacionamento e recuperar oportunidade futura",
      },
    ],
    attachments: ["Proposta_backup_multirregional.pdf"],
  },
  {
    id: "bud-005",
    code: "ORC-0010",
    title: "Portal B2B para autoatendimento de pedidos",
    status: "draft",
    priority: "medium",
    owner: "Camila Nunes",
    createdAt: "2026-03-11",
    updatedAt: "2026-03-17",
    validUntil: "2026-04-03",
    expectedCloseDate: "2026-04-06",
    paymentTerms: "30% entrada, 40% homologacao, 30% go-live",
    deliveryTerm: "Projeto em 8 semanas",
    slaSummary: "Garantia de 60 dias apos publicacao",
    scopeSummary:
      "Desenvolvimento de portal B2B para consulta de catalogo, pedidos, segunda via de boleto e painel de indicadores.",
    assumptions: [
      "Cliente disponibiliza API de estoque e faturamento.",
      "Layout final homologado ate a segunda sprint.",
    ],
    exclusions: ["Nao inclui aplicacao mobile nativa."],
    client: {
      id: "cli-119",
      name: "Alfa Distribuicao",
      segment: "Distribuicao",
      document: "33221098000111",
      city: "Sao Paulo",
      state: "SP",
      contactName: "Renato Lemos",
      contactRole: "Diretor Comercial",
      email: "renato.lemos@alfadistribuicao.com.br",
      phone: "11987651245",
    },
    items: [
      {
        id: "bud-005-item-1",
        description: "Discovery e arquitetura do portal",
        category: "Projeto",
        quantity: 1,
        unitPrice: 9800,
        discount: 0,
        internalCost: 5100,
        estimatedHours: 26,
        deliveryWindow: "Semana 1",
      },
      {
        id: "bud-005-item-2",
        description: "Desenvolvimento do portal B2B",
        category: "Projeto",
        quantity: 1,
        unitPrice: 32600,
        discount: 1200,
        internalCost: 20100,
        estimatedHours: 124,
        deliveryWindow: "Semana 2 a 7",
      },
      {
        id: "bud-005-item-3",
        description: "Treinamento e handover",
        category: "Servico",
        quantity: 1,
        unitPrice: 2600,
        discount: 0,
        internalCost: 1200,
        estimatedHours: 8,
        deliveryWindow: "Semana 8",
      },
    ],
    interactions: [
      {
        id: "bud-005-int-1",
        date: "2026-03-16T15:20:00",
        channel: "whatsapp",
        summary: "Cliente enviou requisitos adicionais para area de catalogo.",
        author: "Camila Nunes",
      },
    ],
    risks: [
      {
        id: "bud-005-risk-1",
        title: "Escopo ainda aberto em integracoes",
        level: "medium",
        impact: "Pode afetar prazo e custo final.",
        mitigation: "Congelar backlog no fechamento da proposta.",
      },
    ],
    nextSteps: [
      {
        id: "bud-005-next-1",
        dueDate: "2026-03-22",
        action: "Concluir escopo de integracoes ERP",
        owner: "Camila Nunes",
        objective: "Converter rascunho em proposta final",
      },
    ],
    attachments: ["Briefing_portal_b2b.pdf"],
  },
  {
    id: "bud-006",
    code: "ORC-0129",
    title: "Renovacao de licencas endpoint corporativo",
    status: "expired",
    priority: "low",
    owner: "Andre Pires",
    createdAt: "2025-12-10",
    updatedAt: "2026-01-16",
    validUntil: "2026-01-20",
    expectedCloseDate: "2026-01-19",
    paymentTerms: "Pagamento unico em 15 dias",
    deliveryTerm: "Ativacao imediata",
    slaSummary: "Suporte comercial em horario comercial",
    scopeSummary:
      "Renovacao anual das licencas de endpoint com ajuste de parque em 220 estacoes.",
    assumptions: ["Quantidade de licencas sujeita a inventario final do cliente."],
    exclusions: ["Nao inclui servicos de implantacao adicional."],
    client: {
      id: "cli-061",
      name: "TransLog Sul",
      segment: "Logistica",
      document: "50400111000109",
      city: "Porto Alegre",
      state: "RS",
      contactName: "Patricia Nobre",
      contactRole: "Coordenadora de TI",
      email: "patricia.nobre@translogsul.com.br",
      phone: "51996339880",
    },
    items: [
      {
        id: "bud-006-item-1",
        description: "Licenca endpoint anual",
        category: "Licenca",
        quantity: 220,
        unitPrice: 28,
        discount: 360,
        internalCost: 18,
        estimatedHours: 4,
        deliveryWindow: "Imediato",
      },
    ],
    interactions: [
      {
        id: "bud-006-int-1",
        date: "2026-01-19T18:05:00",
        channel: "email",
        summary: "Proposta expirou sem retorno final do cliente.",
        author: "Andre Pires",
      },
    ],
    risks: [
      {
        id: "bud-006-risk-1",
        title: "Janela de compra fechada para o trimestre",
        level: "high",
        impact: "Sem previsao de fechamento no curto prazo.",
        mitigation: "Retomar contato no inicio do proximo ciclo orcamentario.",
      },
    ],
    nextSteps: [
      {
        id: "bud-006-next-1",
        dueDate: "2026-04-02",
        action: "Novo contato para renovacao trimestral",
        owner: "Andre Pires",
        objective: "Reativar oportunidade com novo prazo de validade",
      },
    ],
    attachments: ["Renovacao_endpoint_2026.pdf"],
  },
]

export function getBudgetById(id?: string | null) {
  if (!id) return null
  return budgetMockData.find((budget) => budget.id === id) ?? null
}
