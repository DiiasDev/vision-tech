import { type ClientIntegration } from "../../types/integrations.types";

export const integrationsMock: ClientIntegration[] = [
  {
    id: "1",
    clientName: "Empresa Alpha",
    status: "active",
    lastSync: "2025-12-14 18:32",
    apps: [
      {
        id: "app-1",
        name: "ERP Vision",
        version: "v2.4.1",
        status: "active",
        lastUpdate: "2025-12-13",
      },
      {
        id: "app-2",
        name: "Chatbot WhatsApp",
        version: "v1.9.0",
        status: "error",
        lastUpdate: "2025-12-10",
      },
    ],
  },
  {
    id: "2",
    clientName: "Tech Solutions",
    status: "inactive",
    lastSync: "2025-12-01 09:10",
    apps: [
      {
        id: "app-3",
        name: "Landing Page",
        version: "v1.2.3",
        status: "inactive",
        lastUpdate: "2025-11-20",
      },
    ],
  },
];
