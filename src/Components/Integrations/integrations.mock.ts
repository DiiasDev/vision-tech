import { type ClientIntegration } from "../../types/integrations.types";

export const integrationsMock: ClientIntegration[] = [
  {
    id: "1",
    clientName: "Empresa Alpha",
    status: "active",
    lastSync: "2025-12-14 18:32",
    website: {
      url: "https://www.empresaalpha.com.br",
      domain: "empresaalpha.com.br",
      hosting: "AWS EC2 (us-east-1)",
      sslStatus: "active",
    },
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
        errorDetails: {
          errorCode: "API_CONNECTION_FAILED",
          errorMessage: "Falha na conexão com a API do WhatsApp Business. O token de autenticação expirou ou foi revogado.",
          errorReason: "configuration_error",
          occurredAt: "2025-12-14 22:15:30",
          affectedFeatures: [
            "Envio de mensagens automáticas",
            "Recebimento de webhooks",
            "Sincronização de contatos"
          ],
          suggestedAction: "Renovar o token de acesso no Meta Business Manager e atualizar as credenciais no painel de configuração. Documentação: https://docs.whatsapp.com/api/auth"
        }
      },
    ],
    infrastructure: [
      {
        type: "website",
        status: "running",
        errorReason: "none",
        uptime: "99.8%",
        lastCheck: "2025-12-15 10:30",
      },
      {
        type: "database",
        status: "running",
        errorReason: "none",
        uptime: "99.9%",
        lastCheck: "2025-12-15 10:30",
      },
    ],
  },
  {
    id: "2",
    clientName: "Tech Solutions",
    status: "inactive",
    lastSync: "2025-12-01 09:10",
    website: {
      url: "https://techsolutions.com",
      domain: "techsolutions.com",
      hosting: "DigitalOcean Droplet (NYC3)",
      sslStatus: "expired",
    },
    apps: [
      {
        id: "app-3",
        name: "Landing Page",
        version: "v1.2.3",
        status: "inactive",
        lastUpdate: "2025-11-20",
      },
    ],
    infrastructure: [
      {
        type: "website",
        status: "stopped",
        errorReason: "payment_overdue",
        errorMessage: "Pagamento em atraso há 15 dias. Entre em contato com o financeiro.",
        lastCheck: "2025-12-15 10:25",
      },
      {
        type: "database",
        status: "error",
        errorReason: "payment_overdue",
        errorMessage: "Serviço suspenso por falta de pagamento. Renove sua assinatura para reativar.",
        lastCheck: "2025-12-15 10:25",
      },
    ],
  },
];
