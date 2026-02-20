export type ClientStatus = "Ativo" | "Inadimplente" | "Em risco" | "Onboarding"
export type ClientKind = "PJ" | "PF"

export type ClientRecord = {
  id: string
  nome: string
  fantasia?: string
  tipo: ClientKind
  segmento: string
  email: string
  telefone: string
  cidade: string
  gerenteConta: string
  status: ClientStatus
  plano: "Essentials" | "Growth" | "Enterprise"
  mrr: number
  totalGasto: number
  healthScore: number
  ticketMedio: number
  ultimoContato: string
  proximaAcao: string
  openTickets: number
  inadimplenciaDias?: number
}

export type ClientInvoice = {
  id: string
  descricao: string
  valor: number
  vencimento: string
  status: "Pago" | "Pendente" | "Atrasado"
}

export type ClientServiceOrder = {
  id: string
  titulo: string
  prioridade: "Alta" | "Media" | "Baixa"
  status: "Concluida" | "Em andamento" | "Agendada"
  tecnico: string
  agendamento: string
}

export type ClientEquipment = {
  id: string
  nome: string
  serial: string
  categoria: string
  status: "Operacional" | "Monitoramento" | "Critico"
  garantia: string
  ultimaManutencao: string
}

export type ClientFile = {
  id: string
  nome: string
  tipo: string
  tamanho: string
  atualizadoEm: string
  atualizadoPor: string
}

export type ClientNote = {
  id: string
  autor: string
  data: string
  texto: string
}

export type ClientDetails = ClientRecord & {
  cnpjCpf: string
  responsavel: string
  endereco: string
  desde: string
  contatos: Array<{ nome: string; cargo: string; email: string; telefone: string }>
  invoices: ClientInvoice[]
  serviceOrders: ClientServiceOrder[]
  equipments: ClientEquipment[]
  files: ClientFile[]
  notes: ClientNote[]
}

export const clientsData: ClientDetails[] = [
  {
    id: "c-1001",
    nome: "Empresa Alpha Tecnologia",
    fantasia: "Alpha Tech",
    tipo: "PJ",
    segmento: "Tecnologia",
    email: "financeiro@alphatech.com.br",
    telefone: "(11) 3333-9901",
    cidade: "Sao Paulo, SP",
    gerenteConta: "Camila Souza",
    status: "Ativo",
    plano: "Enterprise",
    mrr: 12800,
    totalGasto: 214000,
    healthScore: 92,
    ticketMedio: 17800,
    ultimoContato: "Hoje, 09:20",
    proximaAcao: "Revisao trimestral em 5 dias",
    openTickets: 1,
    cnpjCpf: "12.345.678/0001-10",
    responsavel: "Rafael Mendes",
    endereco: "Av. Paulista, 1520 - Bela Vista - Sao Paulo/SP",
    desde: "Jan 2021",
    contacts: [
      {
        nome: "Rafael Mendes",
        cargo: "Diretor de TI",
        email: "rafael.mendes@alphatech.com.br",
        telefone: "(11) 98800-1122",
      },
      {
        nome: "Talita Moraes",
        cargo: "Coordenadora Financeira",
        email: "talita@alphatech.com.br",
        telefone: "(11) 97788-9900",
      },
    ],
    invoices: [
      { id: "f-2301", descricao: "Mensalidade Enterprise", valor: 12800, vencimento: "05/02/2026", status: "Pago" },
      { id: "f-2302", descricao: "Servico de implantacao", valor: 6400, vencimento: "20/02/2026", status: "Pendente" },
      { id: "f-2298", descricao: "Horas consultoria extra", valor: 2800, vencimento: "12/01/2026", status: "Pago" },
    ],
    serviceOrders: [
      {
        id: "os-7411",
        titulo: "Upgrade de cluster de banco",
        prioridade: "Alta",
        status: "Em andamento",
        tecnico: "Vitor Neves",
        agendamento: "22/02/2026 10:00",
      },
      {
        id: "os-7350",
        titulo: "Revisao de politicas de backup",
        prioridade: "Media",
        status: "Concluida",
        tecnico: "Ana Prado",
        agendamento: "11/02/2026 14:30",
      },
    ],
    equipments: [
      {
        id: "eq-001",
        nome: "Servidor Dell PowerEdge R760",
        serial: "SN-A1B2C3",
        categoria: "Servidor",
        status: "Operacional",
        garantia: "11/2028",
        ultimaManutencao: "02/2026",
      },
      {
        id: "eq-002",
        nome: "Firewall FortiGate 200F",
        serial: "SN-FGT8841",
        categoria: "Seguranca",
        status: "Monitoramento",
        garantia: "03/2027",
        ultimaManutencao: "01/2026",
      },
    ],
    files: [
      {
        id: "arq-1",
        nome: "Contrato_Master_2026.pdf",
        tipo: "PDF",
        tamanho: "2.4 MB",
        atualizadoEm: "14/02/2026",
        atualizadoPor: "Camila Souza",
      },
      {
        id: "arq-2",
        nome: "SLA_Enterprise_v5.docx",
        tipo: "DOCX",
        tamanho: "860 KB",
        atualizadoEm: "09/02/2026",
        atualizadoPor: "Rafael Mendes",
      },
    ],
    notes: [
      {
        id: "n-100",
        autor: "Camila Souza",
        data: "20/02/2026 09:22",
        texto: "Cliente pediu proposta para expandir ambiente de BI no proximo ciclo.",
      },
      {
        id: "n-099",
        autor: "Vitor Neves",
        data: "18/02/2026 16:10",
        texto: "Teste de failover aprovado sem impacto para operacao.",
      },
    ],
  },
  {
    id: "c-1002",
    nome: "Grupo Orion Varejo",
    fantasia: "Orion",
    tipo: "PJ",
    segmento: "Varejo",
    email: "ti@orionvarejo.com",
    telefone: "(21) 3444-2200",
    cidade: "Rio de Janeiro, RJ",
    gerenteConta: "Pedro Lima",
    status: "Em risco",
    plano: "Growth",
    mrr: 8600,
    totalGasto: 98000,
    healthScore: 63,
    ticketMedio: 9200,
    ultimoContato: "Ontem, 17:45",
    proximaAcao: "QBR com diretoria comercial",
    openTickets: 4,
    cnpjCpf: "45.889.004/0001-21",
    responsavel: "Leandro Carvalho",
    endereco: "Rua do Ouvidor, 200 - Centro - Rio de Janeiro/RJ",
    desde: "Ago 2022",
    contacts: [],
    invoices: [
      { id: "f-2201", descricao: "Mensalidade Growth", valor: 8600, vencimento: "07/02/2026", status: "Atrasado" },
    ],
    serviceOrders: [],
    equipments: [],
    files: [],
    notes: [],
    inadimplenciaDias: 9,
  },
  {
    id: "c-1003",
    nome: "Clinica Santa Maria",
    fantasia: "Santa Maria",
    tipo: "PJ",
    segmento: "Saude",
    email: "compras@clinicasm.com.br",
    telefone: "(31) 3550-3400",
    cidade: "Belo Horizonte, MG",
    gerenteConta: "Camila Souza",
    status: "Ativo",
    plano: "Growth",
    mrr: 7400,
    totalGasto: 126500,
    healthScore: 88,
    ticketMedio: 7600,
    ultimoContato: "Hoje, 11:02",
    proximaAcao: "Renovacao anual do contrato",
    openTickets: 2,
    cnpjCpf: "22.110.998/0001-88",
    responsavel: "Dr. Marcelo Alencar",
    endereco: "Av. Afonso Pena, 1200 - Centro - Belo Horizonte/MG",
    desde: "Mar 2020",
    contacts: [],
    invoices: [],
    serviceOrders: [],
    equipments: [],
    files: [],
    notes: [],
  },
  {
    id: "c-1004",
    nome: "Joao Silva",
    tipo: "PF",
    segmento: "Profissional liberal",
    email: "joao.silva@email.com",
    telefone: "(11) 98888-7777",
    cidade: "Campinas, SP",
    gerenteConta: "Julia Castro",
    status: "Inadimplente",
    plano: "Essentials",
    mrr: 980,
    totalGasto: 8200,
    healthScore: 42,
    ticketMedio: 1250,
    ultimoContato: "12/02/2026",
    proximaAcao: "Contato financeiro em 24h",
    openTickets: 0,
    cnpjCpf: "123.456.789-00",
    responsavel: "Joao Silva",
    endereco: "Rua das Acacias, 402 - Campinas/SP",
    desde: "Jun 2023",
    contacts: [],
    invoices: [],
    serviceOrders: [],
    equipments: [],
    files: [],
    notes: [],
    inadimplenciaDias: 23,
  },
  {
    id: "c-1005",
    nome: "Nexum Engenharia",
    fantasia: "Nexum",
    tipo: "PJ",
    segmento: "Engenharia",
    email: "suporte@nexum.com",
    telefone: "(41) 3232-9001",
    cidade: "Curitiba, PR",
    gerenteConta: "Pedro Lima",
    status: "Onboarding",
    plano: "Growth",
    mrr: 5100,
    totalGasto: 5100,
    healthScore: 76,
    ticketMedio: 5100,
    ultimoContato: "Hoje, 14:10",
    proximaAcao: "Treinamento de equipe em 2 dias",
    openTickets: 3,
    cnpjCpf: "78.555.090/0001-44",
    responsavel: "Natalia Gomes",
    endereco: "Rua Nunes Machado, 88 - Batel - Curitiba/PR",
    desde: "Fev 2026",
    contacts: [],
    invoices: [],
    serviceOrders: [],
    equipments: [],
    files: [],
    notes: [],
  },
  {
    id: "c-1006",
    nome: "Studio Cobalto Design",
    fantasia: "Cobalto",
    tipo: "PJ",
    segmento: "Agencia criativa",
    email: "contato@studiocobalto.com",
    telefone: "(51) 3010-4400",
    cidade: "Porto Alegre, RS",
    gerenteConta: "Julia Castro",
    status: "Ativo",
    plano: "Essentials",
    mrr: 2200,
    totalGasto: 37800,
    healthScore: 81,
    ticketMedio: 3200,
    ultimoContato: "18/02/2026",
    proximaAcao: "Apresentar novo modulo de automacao",
    openTickets: 1,
    cnpjCpf: "31.455.778/0001-09",
    responsavel: "Ana Beatriz Coelho",
    endereco: "Rua Mostardeiro, 450 - Moinhos de Vento - Porto Alegre/RS",
    desde: "Out 2021",
    contacts: [],
    invoices: [],
    serviceOrders: [],
    equipments: [],
    files: [],
    notes: [],
  },
]

export function getClientById(id: string) {
  return clientsData.find((client) => client.id === id)
}
