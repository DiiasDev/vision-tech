import { type ServiceItem } from "../../../types/services.types";

export const servicesMock: ServiceItem[] = [
  {
    id: "1",
    name: "Frappe Backend",
    type: "backend",
    environment: "production",
    status: "running",
    uptime: "12d 4h",
    version: "v15.3.0",
    lastCheck: "2025-12-15 20:41",
  },
  {
    id: "2",
    name: "API Vision Tech",
    type: "backend",
    environment: "production",
    status: "error",
    uptime: "0d",
    version: "v1.8.2",
    lastCheck: "2025-12-15 20:40",
    error: {
      message: "Falha ao conectar no banco de dados",
      code: "DB_CONN_TIMEOUT",
      lastOccurrence: "2025-12-15 20:39",
    },
  },
  {
    id: "3",
    name: "Frontend Dashboard",
    type: "application",
    environment: "production",
    status: "running",
    uptime: "7d 11h",
    version: "v2.1.0",
    lastCheck: "2025-12-15 20:41",
  },
  {
    id: "4",
    name: "Worker de Notificações",
    type: "worker",
    environment: "production",
    status: "stopped",
    uptime: "—",
    lastCheck: "2025-12-15 19:55",
  },
];
