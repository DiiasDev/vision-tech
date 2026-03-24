export type ServiceOrderStatus = "scheduled" | "in_progress" | "awaiting_parts" | "completed" | "cancelled"

export type ServiceOrderPriority = "low" | "medium" | "high" | "critical"

export type ServiceOrderClient = {
  id: string
  name: string
  segment: string
  document: string
  city: string
  state: string
  contactName: string
  email: string
  phone: string
}

export type ServiceOrderLaborItem = {
  id: string
  description: string
  technician: string
  estimatedHours: number
  workedHours: number
  hourlyCost: number
  status: "pending" | "done"
}

export type ServiceOrderPartItem = {
  id: string
  sku: string
  description: string
  quantity: number
  unitCost: number
  status: "planned" | "reserved" | "used"
}

export type ServiceOrderServiceItem = {
  id: string
  code: string
  name: string
  category: string
  serviceType: string
  billingModel: string
  billingUnit: string
  estimatedDuration: string
  complexityLevel: string
  responsible: string
  catalogStatus: string
  checkStatus: "pending" | "done"
}

export type ServiceOrderTimelineEvent = {
  id: string
  at: string
  author: string
  event: string
  notes: string
}

export type ServiceOrder = {
  id: string
  code: string
  title: string
  description: string
  status: ServiceOrderStatus
  priority: ServiceOrderPriority
  createdAt: string
  updatedAt: string
  scheduledAt: string
  deadlineDate: string
  concludedAt?: string | null
  coordinator: string
  technician: string
  serviceName: string
  sourceBudgetCode?: string | null
  executionAddress: string
  estimatedValue: number
  checklist: string[]
  notes: string[]
  client: ServiceOrderClient
  serviceItems?: ServiceOrderServiceItem[]
  laborItems: ServiceOrderLaborItem[]
  partItems: ServiceOrderPartItem[]
  timeline: ServiceOrderTimelineEvent[]
}

export type ServiceOrderFinancials = {
  estimatedRevenue: number
  laborCost: number
  partsCost: number
  totalCost: number
  marginValue: number
  marginPercent: number
  totalEstimatedHours: number
  totalWorkedHours: number
}

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

function toDate(value: string) {
  const dateOnlyMatch = DATE_ONLY_REGEX.exec(value)
  if (dateOnlyMatch) {
    const year = Number.parseInt(dateOnlyMatch[1], 10)
    const month = Number.parseInt(dateOnlyMatch[2], 10)
    const day = Number.parseInt(dateOnlyMatch[3], 10)
    return new Date(year, month - 1, day, 12, 0, 0)
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return new Date()
  return parsedDate
}

export function formatServiceOrderDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toDate(value))
}

export function formatServiceOrderDateLong(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(toDate(value))
}

export function formatServiceOrderDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(toDate(value))
}

export function daysUntilServiceOrderDeadline(value: string) {
  const base = new Date()
  const today = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0, 0)
  const deadline = toDate(value)
  const diff = deadline.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function serviceOrderStatusLabel(status: ServiceOrderStatus) {
  if (status === "scheduled") return "Agendada"
  if (status === "in_progress") return "Em andamento"
  if (status === "awaiting_parts") return "Aguardando pecas"
  if (status === "completed") return "Concluida"
  return "Cancelada"
}

export function serviceOrderStatusTone(status: ServiceOrderStatus) {
  if (status === "scheduled") return "border-sky-300/70 bg-sky-100/80 text-sky-700"
  if (status === "in_progress") return "border-amber-300/70 bg-amber-100/80 text-amber-700"
  if (status === "awaiting_parts") return "border-orange-300/70 bg-orange-100/80 text-orange-700"
  if (status === "completed") return "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"
  return "border-zinc-300/70 bg-zinc-100/80 text-zinc-700"
}

export function serviceOrderPriorityLabel(priority: ServiceOrderPriority) {
  if (priority === "critical") return "Critica"
  if (priority === "high") return "Alta"
  if (priority === "medium") return "Media"
  return "Baixa"
}

export function serviceOrderPriorityTone(priority: ServiceOrderPriority) {
  if (priority === "critical") return "border-rose-300/70 bg-rose-100/80 text-rose-700"
  if (priority === "high") return "border-orange-300/70 bg-orange-100/80 text-orange-700"
  if (priority === "medium") return "border-amber-300/70 bg-amber-100/80 text-amber-700"
  return "border-emerald-300/70 bg-emerald-100/80 text-emerald-700"
}

export function isServiceOrderOpen(status: ServiceOrderStatus) {
  return status === "scheduled" || status === "in_progress" || status === "awaiting_parts"
}

export function calculateServiceOrderFinancials(order: ServiceOrder): ServiceOrderFinancials {
  const laborCost = order.laborItems.reduce((acc, item) => acc + item.workedHours * item.hourlyCost, 0)
  const partsCost = order.partItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0)
  const totalCost = laborCost + partsCost
  const marginValue = order.estimatedValue - totalCost
  const marginPercent = order.estimatedValue > 0 ? (marginValue / order.estimatedValue) * 100 : 0
  const totalEstimatedHours = order.laborItems.reduce((acc, item) => acc + item.estimatedHours, 0)
  const totalWorkedHours = order.laborItems.reduce((acc, item) => acc + item.workedHours, 0)

  return {
    estimatedRevenue: order.estimatedValue,
    laborCost,
    partsCost,
    totalCost,
    marginValue,
    marginPercent,
    totalEstimatedHours,
    totalWorkedHours,
  }
}

export function calculateServiceOrderProgress(order: ServiceOrder) {
  if (order.status === "completed") return 100
  if (order.status === "cancelled") return 0

  const checklistItems = order.serviceItems ?? []
  if (checklistItems.length > 0) {
    const doneItems = checklistItems.filter((item) => item.checkStatus === "done").length
    return Math.max(0, Math.min(100, Math.round((doneItems / checklistItems.length) * 100)))
  }

  const totalEstimated = order.laborItems.reduce((acc, item) => acc + item.estimatedHours, 0)
  const totalWorked = order.laborItems.reduce((acc, item) => acc + item.workedHours, 0)

  if (totalEstimated <= 0) {
    if (order.status === "in_progress") return 35
    if (order.status === "awaiting_parts") return 55
    return 15
  }

  return Math.max(0, Math.min(100, Math.round((totalWorked / totalEstimated) * 100)))
}

export const serviceOrderMockData: ServiceOrder[] = [
  {
    id: "so-001",
    code: "OS-0001",
    title: "Reconfiguracao de firewall de borda",
    description:
      "Revisao de regras, aplicacao de politicas por VLAN e ajuste de logs para reduzir falso positivo em alertas de seguranca.",
    status: "in_progress",
    priority: "critical",
    createdAt: "2026-03-05",
    updatedAt: "2026-03-24",
    scheduledAt: "2026-03-24T09:00:00-03:00",
    deadlineDate: "2026-03-26",
    concludedAt: null,
    coordinator: "Marina Lopes",
    technician: "Vitor Neves",
    serviceName: "Seguranca de rede",
    sourceBudgetCode: "ORC-0001",
    executionAddress: "Industria Delta Sul - Joinville/SC",
    estimatedValue: 18400,
    checklist: [
      "Backup da configuracao atual",
      "Janela de mudanca aprovada com cliente",
      "Validar comunicacao VPN filial x matriz",
      "Emitir relatorio de regras alteradas",
    ],
    notes: [
      "Cliente solicitou revisao de whitelist para fornecedores externos.",
      "Monitoramento reforcado por 48h apos aplicacao final.",
    ],
    client: {
      id: "cli-203",
      name: "Industria Delta Sul",
      segment: "Industria metalurgica",
      document: "13.245.678/0001-90",
      city: "Joinville",
      state: "SC",
      contactName: "Carlos Henrique Prado",
      email: "carlos.prado@deltasul.com.br",
      phone: "(47) 99881-1200",
    },
    laborItems: [
      {
        id: "so-001-lab-1",
        description: "Levantamento de topologia e regras",
        technician: "Vitor Neves",
        estimatedHours: 4,
        workedHours: 4,
        hourlyCost: 140,
        status: "done",
      },
      {
        id: "so-001-lab-2",
        description: "Reconfiguracao em ambiente de producao",
        technician: "Vitor Neves",
        estimatedHours: 8,
        workedHours: 6,
        hourlyCost: 160,
        status: "pending",
      },
      {
        id: "so-001-lab-3",
        description: "Teste de conectividade e hardening",
        technician: "Ana Prado",
        estimatedHours: 3,
        workedHours: 1,
        hourlyCost: 150,
        status: "pending",
      },
    ],
    partItems: [
      {
        id: "so-001-part-1",
        sku: "LIC-FW-UTM-01",
        description: "Licenca UTM anual",
        quantity: 1,
        unitCost: 5200,
        status: "reserved",
      },
      {
        id: "so-001-part-2",
        sku: "ACC-RACK-32",
        description: "Kit de organizacao de rack",
        quantity: 2,
        unitCost: 240,
        status: "used",
      },
    ],
    timeline: [
      {
        id: "so-001-timeline-1",
        at: "2026-03-06T10:30:00-03:00",
        author: "Marina Lopes",
        event: "OS criada",
        notes: "Ordem originada a partir do orcamento ORC-0001.",
      },
      {
        id: "so-001-timeline-2",
        at: "2026-03-24T09:04:00-03:00",
        author: "Vitor Neves",
        event: "Check-in tecnico",
        notes: "Inicio da janela de mudanca com validacao do cliente.",
      },
      {
        id: "so-001-timeline-3",
        at: "2026-03-24T12:15:00-03:00",
        author: "Ana Prado",
        event: "Atualizacao operacional",
        notes: "Regras por segmento aplicadas e em monitoramento.",
      },
    ],
  },
  {
    id: "so-002",
    code: "OS-0002",
    title: "Upgrade de cluster VMware",
    description: "Atualizacao de hosts para nova versao de hypervisor com validacao de HA e failover.",
    status: "scheduled",
    priority: "high",
    createdAt: "2026-03-09",
    updatedAt: "2026-03-19",
    scheduledAt: "2026-03-27T20:00:00-03:00",
    deadlineDate: "2026-03-30",
    concludedAt: null,
    coordinator: "Pedro Lima",
    technician: "Bruno Costa",
    serviceName: "Virtualizacao",
    sourceBudgetCode: "ORC-0004",
    executionAddress: "Matriz Grupo Orion - Rio de Janeiro/RJ",
    estimatedValue: 12600,
    checklist: ["Validar snapshot VMs criticas", "Plano de rollback aprovado", "Checklist de firmware atualizado"],
    notes: ["Janela noturna para evitar indisponibilidade operacional."],
    client: {
      id: "cli-305",
      name: "Grupo Orion Varejo",
      segment: "Varejo",
      document: "45.889.004/0001-21",
      city: "Rio de Janeiro",
      state: "RJ",
      contactName: "Leandro Carvalho",
      email: "leandro.carvalho@orion.com.br",
      phone: "(21) 98877-3322",
    },
    laborItems: [
      {
        id: "so-002-lab-1",
        description: "Preparacao e analise de compatibilidade",
        technician: "Bruno Costa",
        estimatedHours: 5,
        workedHours: 3,
        hourlyCost: 150,
        status: "pending",
      },
      {
        id: "so-002-lab-2",
        description: "Execucao de upgrade dos hosts",
        technician: "Bruno Costa",
        estimatedHours: 6,
        workedHours: 0,
        hourlyCost: 170,
        status: "pending",
      },
    ],
    partItems: [
      {
        id: "so-002-part-1",
        sku: "SUP-VMW-PRM",
        description: "Suporte premium fabricante",
        quantity: 1,
        unitCost: 3200,
        status: "planned",
      },
    ],
    timeline: [
      {
        id: "so-002-timeline-1",
        at: "2026-03-09T15:20:00-03:00",
        author: "Pedro Lima",
        event: "OS criada",
        notes: "Escopo aprovado pela area de infraestrutura.",
      },
      {
        id: "so-002-timeline-2",
        at: "2026-03-18T11:40:00-03:00",
        author: "Bruno Costa",
        event: "Pre-check tecnico",
        notes: "Compatibilidade validada para todos os hosts do cluster.",
      },
    ],
  },
  {
    id: "so-003",
    code: "OS-0003",
    title: "Substituicao de switch core",
    description: "Troca do switch principal com migracao de uplinks e revisao de redundancia STP.",
    status: "awaiting_parts",
    priority: "high",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-22",
    scheduledAt: "2026-03-14T08:30:00-03:00",
    deadlineDate: "2026-03-20",
    concludedAt: null,
    coordinator: "Camila Souza",
    technician: "Rafael Teixeira",
    serviceName: "Infraestrutura de rede",
    sourceBudgetCode: "ORC-0003",
    executionAddress: "CD Logistica Norte - Campinas/SP",
    estimatedValue: 22800,
    checklist: ["Confirmar recebimento de modulo SFP", "Atualizar diagrama de portas"],
    notes: ["Projeto parado aguardando chegada do lote de SFP 10Gb."],
    client: {
      id: "cli-120",
      name: "Logistica Norte",
      segment: "Logistica",
      document: "91.222.334/0001-44",
      city: "Campinas",
      state: "SP",
      contactName: "Felipe Araujo",
      email: "felipe.araujo@lognorte.com.br",
      phone: "(19) 97770-4001",
    },
    laborItems: [
      {
        id: "so-003-lab-1",
        description: "Planejamento de migracao",
        technician: "Rafael Teixeira",
        estimatedHours: 4,
        workedHours: 4,
        hourlyCost: 135,
        status: "done",
      },
      {
        id: "so-003-lab-2",
        description: "Passagem de cabos e reorganizacao de patch panel",
        technician: "Rafael Teixeira",
        estimatedHours: 7,
        workedHours: 5,
        hourlyCost: 125,
        status: "pending",
      },
    ],
    partItems: [
      {
        id: "so-003-part-1",
        sku: "SW-CORE-48P",
        description: "Switch core 48 portas",
        quantity: 1,
        unitCost: 9100,
        status: "reserved",
      },
      {
        id: "so-003-part-2",
        sku: "SFP-10G-SR",
        description: "Modulo SFP 10G SR",
        quantity: 4,
        unitCost: 650,
        status: "planned",
      },
    ],
    timeline: [
      {
        id: "so-003-timeline-1",
        at: "2026-03-01T09:05:00-03:00",
        author: "Camila Souza",
        event: "OS criada",
        notes: "Abertura da ordem para modernizacao do core.",
      },
      {
        id: "so-003-timeline-2",
        at: "2026-03-21T17:40:00-03:00",
        author: "Rafael Teixeira",
        event: "Bloqueio de execucao",
        notes: "Sem todos os SFPs necessarios para finalizar migracao.",
      },
    ],
  },
  {
    id: "so-004",
    code: "OS-0004",
    title: "Treinamento de resposta a incidentes",
    description: "Workshop tecnico para time de infraestrutura com simulacao de ataque e plano de acao.",
    status: "completed",
    priority: "medium",
    createdAt: "2026-02-18",
    updatedAt: "2026-03-03",
    scheduledAt: "2026-02-28T13:30:00-03:00",
    deadlineDate: "2026-03-03",
    concludedAt: "2026-03-03",
    coordinator: "Marina Lopes",
    technician: "Ana Prado",
    serviceName: "Capacitacao tecnica",
    sourceBudgetCode: "ORC-0002",
    executionAddress: "Remoto - Teams",
    estimatedValue: 7800,
    checklist: ["Material de apoio enviado", "Presenca dos times confirmada", "Avaliacao de aprendizado aplicada"],
    notes: ["Cliente solicitou modulo extra para nova equipe em abril."],
    client: {
      id: "cli-203",
      name: "Industria Delta Sul",
      segment: "Industria metalurgica",
      document: "13.245.678/0001-90",
      city: "Joinville",
      state: "SC",
      contactName: "Carlos Henrique Prado",
      email: "carlos.prado@deltasul.com.br",
      phone: "(47) 99881-1200",
    },
    laborItems: [
      {
        id: "so-004-lab-1",
        description: "Preparacao de conteudo",
        technician: "Ana Prado",
        estimatedHours: 6,
        workedHours: 6,
        hourlyCost: 110,
        status: "done",
      },
      {
        id: "so-004-lab-2",
        description: "Execucao do workshop",
        technician: "Ana Prado",
        estimatedHours: 4,
        workedHours: 4,
        hourlyCost: 130,
        status: "done",
      },
    ],
    partItems: [],
    timeline: [
      {
        id: "so-004-timeline-1",
        at: "2026-02-18T10:10:00-03:00",
        author: "Marina Lopes",
        event: "OS criada",
        notes: "Escopo aprovado para treinamento de 1 turma.",
      },
      {
        id: "so-004-timeline-2",
        at: "2026-03-03T17:55:00-03:00",
        author: "Ana Prado",
        event: "OS concluida",
        notes: "Treinamento finalizado com nota media 8.9.",
      },
    ],
  },
  {
    id: "so-005",
    code: "OS-0005",
    title: "Migracao de backups para storage dedicado",
    description: "Mudanca da rotina de backup para storage dedicado com retencao de 90 dias.",
    status: "completed",
    priority: "low",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-22",
    scheduledAt: "2026-02-15T19:00:00-03:00",
    deadlineDate: "2026-02-22",
    concludedAt: "2026-02-21",
    coordinator: "Pedro Lima",
    technician: "Bruno Costa",
    serviceName: "Backup e continuidade",
    sourceBudgetCode: "ORC-0005",
    executionAddress: "Alfa Foods - Sao Paulo/SP",
    estimatedValue: 9800,
    checklist: ["Replicacao validada", "Restore de teste executado", "Politica de retencao aplicada"],
    notes: ["Projeto concluido sem indisponibilidade."],
    client: {
      id: "cli-480",
      name: "Alfa Foods",
      segment: "Alimentos",
      document: "05.668.020/0001-11",
      city: "Sao Paulo",
      state: "SP",
      contactName: "Priscila Rocha",
      email: "priscila.rocha@alfafoods.com.br",
      phone: "(11) 96655-1010",
    },
    laborItems: [
      {
        id: "so-005-lab-1",
        description: "Configuracao de jobs",
        technician: "Bruno Costa",
        estimatedHours: 5,
        workedHours: 4,
        hourlyCost: 140,
        status: "done",
      },
      {
        id: "so-005-lab-2",
        description: "Validacao de restore",
        technician: "Bruno Costa",
        estimatedHours: 3,
        workedHours: 3,
        hourlyCost: 140,
        status: "done",
      },
    ],
    partItems: [
      {
        id: "so-005-part-1",
        sku: "NAS-24TB",
        description: "Storage dedicado 24TB",
        quantity: 1,
        unitCost: 4100,
        status: "used",
      },
    ],
    timeline: [
      {
        id: "so-005-timeline-1",
        at: "2026-02-10T08:40:00-03:00",
        author: "Pedro Lima",
        event: "OS criada",
        notes: "Projeto aprovado com janela noturna.",
      },
      {
        id: "so-005-timeline-2",
        at: "2026-02-21T22:10:00-03:00",
        author: "Bruno Costa",
        event: "OS concluida",
        notes: "Retencao de 90 dias ativa e restore validado.",
      },
    ],
  },
  {
    id: "so-006",
    code: "OS-0006",
    title: "Reorganizacao de cabeamento rack 04",
    description: "Atividade cancelada apos redefinicao de layout fisico no datacenter do cliente.",
    status: "cancelled",
    priority: "medium",
    createdAt: "2026-03-12",
    updatedAt: "2026-03-14",
    scheduledAt: "2026-03-18T08:00:00-03:00",
    deadlineDate: "2026-03-21",
    concludedAt: null,
    coordinator: "Camila Souza",
    technician: "Rafael Teixeira",
    serviceName: "Organizacao fisica",
    sourceBudgetCode: null,
    executionAddress: "Data Center Sul - Curitiba/PR",
    estimatedValue: 3600,
    checklist: ["Cliente formalizou cancelamento"],
    notes: ["Nova janela sera replanejada no proximo trimestre."],
    client: {
      id: "cli-550",
      name: "Data Center Sul",
      segment: "Servicos gerenciados",
      document: "07.123.450/0001-77",
      city: "Curitiba",
      state: "PR",
      contactName: "Lara Gomes",
      email: "lara.gomes@dcsul.com.br",
      phone: "(41) 98888-7711",
    },
    laborItems: [
      {
        id: "so-006-lab-1",
        description: "Levantamento inicial",
        technician: "Rafael Teixeira",
        estimatedHours: 3,
        workedHours: 1,
        hourlyCost: 110,
        status: "pending",
      },
    ],
    partItems: [],
    timeline: [
      {
        id: "so-006-timeline-1",
        at: "2026-03-12T11:15:00-03:00",
        author: "Camila Souza",
        event: "OS criada",
        notes: "Atividade vinculada ao plano de reorganizacao fisica.",
      },
      {
        id: "so-006-timeline-2",
        at: "2026-03-14T09:00:00-03:00",
        author: "Lara Gomes",
        event: "OS cancelada",
        notes: "Cliente adiou a reforma estrutural do ambiente.",
      },
    ],
  },
]
