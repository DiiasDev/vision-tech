export type AppStatus = "active" | "inactive" | "error";

export interface IntegrationApp {
  id: string;
  name: string;
  version: string;
  status: AppStatus;
  lastUpdate: string;
}

export interface ClientIntegration {
  id: string;
  clientName: string;
  status: "active" | "inactive";
  apps: IntegrationApp[];
  lastSync: string;
}
