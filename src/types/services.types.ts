export type ServiceStatus = "running" | "stopped" | "error";

export interface ServiceError {
  message: string;
  code?: string;
  lastOccurrence: string;
}

export interface ServiceLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  details?: any;
}

export interface ServiceItem {
  id: string;
  name: string;
  type: "backend" | "application" | "worker";
  environment: "production" | "staging" | "development";
  status: ServiceStatus;
  uptime: string;
  lastCheck: string;
  version?: string;
  error?: ServiceError;
  logs?: ServiceLog[];
}
