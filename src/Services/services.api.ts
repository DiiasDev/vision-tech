// src/Services/services.api.ts
import { frappe } from "./frappeClient";
import { type ServiceItem } from "../types/services.types";

/**
 * Busca o status de todos os serviços monitorados
 * Este endpoint precisa ser criado no backend Frappe
 */
export async function getServicesStatus(): Promise<ServiceItem[]> {
  try {
    const response = await frappe.get("/method/vision_tech.api.services.get_services_status");
    return response.data.message || [];
  } catch (error: any) {
    // Se for 404 ou 417, endpoint não existe ainda
    if (error.response?.status === 404 || error.response?.status === 417) {
      console.log("Endpoint de serviços customizados ainda não disponível");
      return [];
    }
    console.error("Erro ao buscar status dos serviços:", error);
    return [];
  }
}

/**
 * Busca os logs de um serviço específico
 */
export async function getServiceLogs(serviceId: string, limit: number = 50): Promise<any[]> {
  try {
    const response = await frappe.get("/method/vision_tech.api.services.get_service_logs", {
      params: { service_id: serviceId, limit }
    });
    return response.data.message || [];
  } catch (error) {
    console.error(`Erro ao buscar logs do serviço ${serviceId}:`, error);
    throw error;
  }
}

/**
 * Busca os erros recentes de um serviço
 */
export async function getServiceErrors(serviceId: string, limit: number = 10): Promise<any[]> {
  try {
    const response = await frappe.get("/method/vision_tech.api.services.get_service_errors", {
      params: { service_id: serviceId, limit }
    });
    return response.data.message || [];
  } catch (error) {
    console.error(`Erro ao buscar erros do serviço ${serviceId}:`, error);
    throw error;
  }
}

/**
 * Verifica o status do backend Frappe
 */
export async function checkFrappeStatus(): Promise<ServiceItem> {
  try {
    const startTime = Date.now();
    const response = await frappe.get("/method/frappe.utils.change_log.get_versions");
    const responseTime = Date.now() - startTime;
    
    const versions = response.data.message || {};
    
    // Extrai apenas a versão do Frappe como string
    let frappeVersion = "unknown";
    if (typeof versions.frappe === "string") {
      frappeVersion = versions.frappe;
    } else if (typeof versions.frappe === "object" && versions.frappe?.version) {
      frappeVersion = versions.frappe.version;
    }
    
    const uptimeValue = await getFrappeUptime();
    
    return {
      id: "frappe-backend",
      name: "Frappe Backend",
      type: "backend",
      environment: "production",
      status: "running",
      uptime: uptimeValue,
      version: frappeVersion,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erro ao verificar status do Frappe:", error);
    return {
      id: "frappe-backend",
      name: "Frappe Backend",
      type: "backend",
      environment: "production",
      status: "error",
      uptime: "—",
      lastCheck: new Date().toISOString(),
      error: {
        message: "Falha ao conectar no backend Frappe",
        code: "CONNECTION_ERROR",
        lastOccurrence: new Date().toISOString(),
      }
    };
  }
}

/**
 * Verifica o status do frontend Vision Tech
 */
export function checkVisionTechStatus(): ServiceItem {
  const startTime = performance.now();
  const uptime = performance.now();
  
  // Calcula o uptime baseado em quando a aplicação iniciou
  const uptimeSeconds = Math.floor(uptime / 1000);
  const uptimeFormatted = formatUptime(uptimeSeconds);
  
  return {
    id: "vision-tech-frontend",
    name: "Vision Tech Frontend",
    type: "application",
    environment: "production",
    status: "running",
    uptime: uptimeFormatted,
    version: "v1.0.0",
    lastCheck: new Date().toISOString(),
  };
}

/**
 * Busca o uptime do Frappe Backend
 */
async function getFrappeUptime(): Promise<string> {
  try {
    // Tenta buscar uptime do sistema (pode não existir em todas as versões)
    const response = await frappe.get("/method/frappe.utils.get_system_uptime");
    const uptime = response.data.message;
    
    // Retorna como string se for válido
    if (typeof uptime === "string") {
      return uptime;
    }
    
    return "—";
  } catch (error) {
    // Método não existe ou erro na API, retorna placeholder
    return "—";
  }
}

/**
 * Formata o uptime em segundos para formato legível
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Obtém todos os serviços (Frappe + Vision Tech)
 */
export async function getAllServices(): Promise<ServiceItem[]> {
  const services: ServiceItem[] = [];
  
  try {
    // Verifica Frappe Backend
    const frappeStatus = await checkFrappeStatus();
    services.push(frappeStatus);
    
    // Verifica Vision Tech Frontend
    const visionTechStatus = checkVisionTechStatus();
    services.push(visionTechStatus);
    
    // Tenta buscar serviços adicionais do backend (se houver endpoint customizado)
    try {
      const additionalServices = await getServicesStatus();
      services.push(...additionalServices);
    } catch (error) {
      // Endpoint customizado não existe ainda, apenas ignora
      console.log("Endpoint de serviços customizados não disponível");
    }
    
    return services;
  } catch (error) {
    console.error("Erro ao buscar todos os serviços:", error);
    // Retorna pelo menos o Vision Tech se Frappe falhar
    return [checkVisionTechStatus()];
  }
}
