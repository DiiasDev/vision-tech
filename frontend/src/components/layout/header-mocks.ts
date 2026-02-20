export type SystemStatus = "online" | "offline"

export type HeaderUser = {
  fullName: string
  role: string
}

export type HeaderNotificationType = "birthday" | "inventory" | "system"

export type HeaderNotification = {
  id: string
  title: string
  description: string
  timestamp: string
  type: HeaderNotificationType
  unread?: boolean
}

export const mockSystemStatus: SystemStatus = "online"

export const mockHeaderUser: HeaderUser = {
  fullName: "Diego Teixeira",
  role: "Administrador",
}

export const mockNotifications: HeaderNotification[] = [
  {
    id: "1",
    title: "Aniversario de cliente",
    description: "Fernanda Silva faz aniversario hoje.",
    timestamp: "Hoje, 09:00",
    type: "birthday",
    unread: true,
  },
  {
    id: "2",
    title: "Estoque esgotando",
    description: "Cabo CAT6 - Restam 8 unidades no estoque.",
    timestamp: "Hoje, 10:32",
    type: "inventory",
    unread: true,
  },
  {
    id: "3",
    title: "Instabilidade detectada",
    description: "API de pagamentos com tempo de resposta elevado.",
    timestamp: "Hoje, 11:15",
    type: "system",
  },
]
