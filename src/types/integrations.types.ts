export type AppStatus = "active" | "inactive" | "error";
export type InfraStatus = "running" | "stopped" | "error";
export type ErrorReason = "payment_overdue" | "maintenance" | "server_error" | "configuration_error" | "resource_limit" | "none";

export interface AppErrorDetails {
  errorCode: string;
  errorMessage: string;
  errorReason: ErrorReason;
  occurredAt: string;
  affectedFeatures?: string[];
  suggestedAction: string;
}

export interface InfrastructureStatus {
  type: "website" | "database";
  status: InfraStatus;
  errorReason?: ErrorReason;
  errorMessage?: string;
  uptime?: string;
  lastCheck: string;
}

export interface IntegrationApp {
  id: string;
  name: string;
  version: string;
  status: AppStatus;
  lastUpdate: string;
  errorDetails?: AppErrorDetails;
}

export interface ClientIntegration {
  id: string;
  clientName: string;
  status: "active" | "inactive";
  apps: IntegrationApp[];
  lastSync: string;
  infrastructure: InfrastructureStatus[];
}
