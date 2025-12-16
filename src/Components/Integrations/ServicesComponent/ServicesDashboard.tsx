import { useEffect, useState } from "react";
import { ServicesSummaryCards } from "./ServicesSummaryCards";
import { ServiceCard } from "./ServiceCard";
import { Server, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { type ServiceItem } from "../../../types/services.types";
import { getAllServices } from "../../../Services/services.api";

export default function ServicesDashboard() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadServices = async () => {
    try {
      setIsRefreshing(true);
      const data = await getAllServices();
      setServices(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError("Erro ao carregar status dos serviços");
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadServices();

    // Atualiza automaticamente a cada 30 segundos
    const interval = setInterval(() => {
      loadServices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const systemStatus = services.some(s => s.status === "error") 
    ? "error" 
    : services.some(s => s.status === "stopped") 
    ? "warning" 
    : "online";

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header aprimorado */}
      <div className="bg-[var(--page-bg-secondary)] p-8 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-[var(--brand-blue)]/10 rounded-xl border border-[var(--brand-blue)]/20">
              <Server size={32} className="text-[var(--brand-blue)]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[var(--sidebar-text)] mb-2 tracking-tight">
                Serviços & Backend
              </h1>
              <p className="text-base text-[var(--sidebar-text-secondary)] flex items-center gap-2">
                <span 
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    systemStatus === "online" ? "bg-green-500" : 
                    systemStatus === "warning" ? "bg-yellow-500" : 
                    "bg-red-500"
                  }`}
                ></span>
                Monitoramento de aplicações, serviços e infraestrutura
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadServices}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 rounded-xl hover:bg-[var(--brand-blue)]/20 transition-colors disabled:opacity-50"
              title="Atualizar status"
            >
              <RefreshCw size={16} className={`text-[var(--brand-blue)] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-[var(--brand-blue)] font-semibold text-sm">
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </span>
            </button>
            <div 
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl ${
                systemStatus === "online" 
                  ? "bg-green-500/10 border-green-500/20" 
                  : systemStatus === "warning"
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              {systemStatus === "online" ? (
                <>
                  <TrendingUp size={18} className="text-green-500" />
                  <span className="text-green-500 font-semibold text-sm">Online</span>
                </>
              ) : systemStatus === "warning" ? (
                <>
                  <AlertCircle size={18} className="text-yellow-500" />
                  <span className="text-yellow-500 font-semibold text-sm">Atenção</span>
                </>
              ) : (
                <>
                  <AlertCircle size={18} className="text-red-500" />
                  <span className="text-red-500 font-semibold text-sm">Erro</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Última atualização */}
        <div className="mt-4 text-xs text-[var(--sidebar-text-secondary)]">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Erro ao carregar */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-500 font-medium">{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-[var(--brand-blue)]" size={32} />
          <span className="ml-3 text-[var(--sidebar-text-secondary)]">
            Carregando status dos serviços...
          </span>
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <ServicesSummaryCards data={services} />

          {/* Seção de serviços */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[var(--sidebar-text)] mb-2">Serviços Ativos</h2>
              <p className="text-sm text-[var(--sidebar-text-secondary)]">
                Gerencie e monitore todos os serviços e aplicações backend
              </p>
            </div>
            {services.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {services.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--sidebar-text-secondary)]">
                Nenhum serviço encontrado
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
