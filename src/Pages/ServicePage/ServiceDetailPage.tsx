import { useParams, useNavigate } from "react-router-dom";
import { ServiceStatusBadge } from "../../Components/Integrations/ServicesComponent/ServiceStatusBadge";
import { ArrowLeft, Clock, Activity, Server, AlertTriangle, CheckCircle2, XCircle, Code, PlayCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { ServiceItem } from "../../types/services.types";
import { getAllServices } from "../../Services/services.api";
import { formatDateTime } from "../../Utils/Formatter";

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadService = async () => {
    try {
      setRefreshing(true);
      const services = await getAllServices();
      const foundService = services.find((s) => s.id === serviceId);
      setService(foundService || null);
    } catch (error) {
      console.error("Erro ao carregar serviço:", error);
      setService(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadService();

    // Atualiza a cada 30 segundos
    const interval = setInterval(() => {
      loadService();
    }, 30000);

    return () => clearInterval(interval);
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-[var(--brand-blue)]" size={32} />
          <span className="text-[var(--sidebar-text-secondary)] text-lg">
            Carregando detalhes do serviço...
          </span>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-red-400 text-xl font-bold">
                Serviço não encontrado
              </h2>
              <p className="text-red-400/70 text-sm">
                O serviço solicitado não existe
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/integracoes/backend")}
            className="mt-6 w-full px-5 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all font-medium"
          >
            Voltar para Serviços
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4 bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
        <button
          onClick={() => navigate("/integracoes/backend")}
          className="p-3 hover:bg-[var(--sidebar-hover)] rounded-xl transition-all hover:scale-105 active:scale-95 group"
          aria-label="Voltar"
        >
          <ArrowLeft size={24} className="text-[var(--sidebar-icon)] group-hover:text-[var(--sidebar-text)] transition-colors" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[var(--sidebar-text)] mb-1 tracking-tight">
            {service.name}
          </h1>
          <p className="text-sm text-[var(--sidebar-text-secondary)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]"></span>
            Monitoramento detalhado do serviço
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadService}
            disabled={refreshing}
            className="p-3 hover:bg-[var(--sidebar-hover)] rounded-xl transition-all disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw size={20} className={`text-[var(--brand-blue)] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <ServiceStatusBadge status={service.status} />
        </div>
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-[var(--brand-blue)]/40 transition-all hover:shadow-lg group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--brand-blue)]/10 rounded-xl group-hover:scale-110 transition-transform border border-[var(--brand-blue)]/20">
              <Server size={28} className="text-[var(--brand-blue)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--sidebar-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">
                Tipo de Serviço
              </h3>
              <p className="text-[var(--sidebar-text)] text-lg font-bold capitalize">
                {service.type}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-[var(--brand-blue)]/40 transition-all hover:shadow-lg group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--brand-blue)]/10 rounded-xl group-hover:scale-110 transition-transform border border-[var(--brand-blue)]/20">
              <Activity size={28} className="text-[var(--brand-blue)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--sidebar-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">
                Ambiente
              </h3>
              <p className="text-[var(--sidebar-text)] text-lg font-bold capitalize">
                {service.environment}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-green-500/40 transition-all hover:shadow-lg group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform border border-green-500/20">
              <Clock size={28} className="text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--sidebar-text-secondary)] text-xs font-semibold uppercase tracking-wider mb-1">
                Uptime
              </h3>
              <p className="text-green-500 text-lg font-bold">
                {service.uptime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status e Versão */}
        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
          <h2 className="text-xl font-bold text-[var(--sidebar-text)] mb-4">Informações do Sistema</h2>
          <div className="space-y-4">
            {service.version && (
              <div className="flex items-center justify-between p-4 bg-[var(--page-bg)] rounded-xl border border-[var(--sidebar-divider)]">
                <div className="flex items-center gap-3">
                  <Code size={20} className="text-[var(--brand-blue)]" />
                  <span className="text-[var(--sidebar-text-secondary)] text-sm font-medium">Versão</span>
                </div>
                <span className="text-[var(--sidebar-text)] font-mono font-semibold">{service.version}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 bg-[var(--page-bg)] rounded-xl border border-[var(--sidebar-divider)]">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-[var(--brand-blue)]" />
                <span className="text-[var(--sidebar-text-secondary)] text-sm font-medium">Última Verificação</span>
              </div>
              <span className="text-[var(--sidebar-text)] font-semibold">{formatDateTime(service.lastCheck)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[var(--page-bg)] rounded-xl border border-[var(--sidebar-divider)]">
              <div className="flex items-center gap-3">
                <PlayCircle size={20} className="text-[var(--brand-blue)]" />
                <span className="text-[var(--sidebar-text-secondary)] text-sm font-medium">Status do Serviço</span>
              </div>
              <ServiceStatusBadge status={service.status} />
            </div>
          </div>
        </div>

        {/* Status Visual */}
        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
          <h2 className="text-xl font-bold text-[var(--sidebar-text)] mb-4">Status Operacional</h2>
          
          {service.status === "running" && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-green-500 font-bold text-lg mb-2">
                    ✅ Serviço Operacional
                  </h3>
                  <p className="text-[var(--sidebar-text-secondary)] text-sm leading-relaxed">
                    O serviço está funcionando normalmente. Todas as verificações de saúde passaram com sucesso.
                  </p>
                  <div className="mt-4 p-3 bg-[var(--page-bg)] rounded-lg">
                    <p className="text-xs text-[var(--sidebar-text-secondary)]">
                      💡 <strong>Próxima ação:</strong> Nenhuma ação necessária no momento. Monitoramento contínuo ativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {service.status === "stopped" && (
            <div className="bg-[var(--sidebar-hover)] border border-[var(--sidebar-divider)] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[var(--sidebar-hover)] rounded-xl border border-[var(--sidebar-divider)]">
                  <XCircle size={32} className="text-[var(--sidebar-text-secondary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[var(--sidebar-text)] font-bold text-lg mb-2">
                    ⏸️ Serviço Parado
                  </h3>
                  <p className="text-[var(--sidebar-text-secondary)] text-sm leading-relaxed">
                    O serviço está parado e não está respondendo a requisições.
                  </p>
                  <div className="mt-4 p-3 bg-[var(--page-bg)] rounded-lg">
                    <p className="text-xs text-[var(--sidebar-text-secondary)]">
                      💡 <strong>Próxima ação:</strong> Iniciar o serviço manualmente ou verificar logs para identificar o motivo da parada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {service.status === "error" && service.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-500 font-bold text-lg mb-2">
                    ⚠️ Serviço com Erro
                  </h3>
                  <p className="text-red-400 text-sm leading-relaxed mb-3">
                    {service.error.message}
                  </p>
                  {service.error.code && (
                    <div className="mb-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <p className="text-xs text-red-400">
                        <strong>Código:</strong> <span className="font-mono">{service.error.code}</span>
                      </p>
                      <p className="text-xs text-red-400 mt-1">
                        <strong>Última ocorrência:</strong> {service.error.lastOccurrence}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-[var(--page-bg)] rounded-lg">
                    <p className="text-xs text-red-400">
                      💡 <strong>Próxima ação:</strong> Verificar logs do sistema, reiniciar o serviço ou escalar para a equipe técnica.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
        <h2 className="text-xl font-bold text-[var(--sidebar-text)] mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="px-6 py-3 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/80 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2">
            <PlayCircle size={18} />
            Reiniciar Serviço
          </button>
          <button className="px-6 py-3 bg-[var(--sidebar-hover)] hover:bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text)] rounded-xl transition-all font-medium border border-[var(--sidebar-divider)]">
            Ver Logs
          </button>
          <button className="px-6 py-3 bg-[var(--sidebar-hover)] hover:bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text)] rounded-xl transition-all font-medium border border-[var(--sidebar-divider)]">
            Métricas
          </button>
          <button className="px-6 py-3 bg-[var(--sidebar-hover)] hover:bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text)] rounded-xl transition-all font-medium border border-[var(--sidebar-divider)]">
            Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
