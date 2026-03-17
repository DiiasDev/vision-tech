export type AgendaPriority = "alta" | "media" | "baixa"

export type AgendaStatus = "confirmado" | "deslocamento" | "em_execucao" | "concluido"

export type AgendaQueue = "instalacao" | "manutencao" | "suporte" | "garantia"

export type AgendaQueueFilter = AgendaQueue | "todos" | "criticos"

export type AgendaTechnicianAvailability = "disponivel" | "em_rota" | "folga"

export type AgendaTechnician = {
  id: string
  name: string
  initials: string
  specialty: string
  base: string
  availability: AgendaTechnicianAvailability
  accent: string
  accentForeground: string
}

export type AgendaService = {
  id: string
  title: string
  client: string
  date: string
  startTime: string
  endTime: string
  address: string
  district: string
  technicianId: string
  status: AgendaStatus
  priority: AgendaPriority
  queue: AgendaQueue
  equipment: string
  checklist: string[]
  slaMinutes: number
  estimateMinutes: number
}
