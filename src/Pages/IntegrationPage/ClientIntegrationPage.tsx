import { useParams, useNavigate } from "react-router-dom";
import { integrationsMock } from "../../Components/Integrations/integrations.mock";
import { StatusBadge } from "../../Components/Integrations/StatusBadge";
import { ClientIntegrationApps } from "../../Components/Integrations/ClientIntegrationApps";
import { ArrowLeft, Clock, Activity, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function ClientIntegrationPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const client = integrationsMock.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-red-400 text-xl font-bold">
                Cliente não encontrado
              </h2>
              <p className="text-red-400/70 text-sm">
                O cliente solicitado não existe
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/integracoes/clientes")}
            className="mt-6 w-full px-5 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all font-medium"
          >
            Voltar para Integrações
          </button>
        </div>
      </div>
    );
  }

  const activeApps = client.apps.filter((app) => app.status === "active").length;
  const inactiveApps = client.apps.filter((app) => app.status === "inactive").length;
  const errorApps = client.apps.filter((app) => app.status === "error").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4 bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
        <button
          onClick={() => navigate("/integracoes/clientes")}
          className="p-3 hover:bg-[var(--sidebar-hover)] rounded-xl transition-all hover:scale-105 active:scale-95 group"
          aria-label="Voltar"
        >
          <ArrowLeft size={24} className="text-[var(--sidebar-icon)] group-hover:text-[var(--sidebar-text)] transition-colors" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[var(--sidebar-text)] mb-1 tracking-tight">
            {client.clientName}
          </h1>
          <p className="text-sm text-[var(--sidebar-text-secondary)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]"></span>
            Detalhes da integração e aplicações
          </p>
        </div>
        <StatusBadge status={client.status} />
      </div>

      {/* Card de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-[var(--brand-blue)]/40 transition-all hover:shadow-lg group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--brand-blue)]/10 rounded-xl group-hover:scale-110 transition-transform border border-[var(--brand-blue)]/20">
              <Clock size={28} className="text-[var(--brand-blue)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--sidebar-text)] font-semibold text-lg mb-1">
                Última Sincronização
              </h3>
              <p className="text-[var(--brand-blue-light)] text-base font-medium">
                {client.lastSync}
              </p>
              <p className="text-[var(--sidebar-text-secondary)] text-xs mt-1">
                Sincronização automática ativa
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-green-500/40 transition-all hover:shadow-lg group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform border border-green-500/20">
              <Activity size={28} className="text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--sidebar-text)] font-semibold text-lg mb-1">
                Total de Aplicações
              </h3>
              <p className="text-green-500 text-base font-medium">
                {client.apps.length} {client.apps.length === 1 ? 'aplicação' : 'aplicações'}
              </p>
              <p className="text-[var(--sidebar-text-secondary)] text-xs mt-1">
                {activeApps} ativa{activeApps !== 1 ? 's' : ''} no momento
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas das Aplicações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-green-500/40 transition-all hover:shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--sidebar-text-secondary)] text-sm font-semibold uppercase tracking-wider">
              Ativas
            </h3>
            <CheckCircle2 size={20} className="text-green-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-4xl font-bold text-green-500 mb-1">
            {activeApps}
          </p>
          <p className="text-[var(--sidebar-text-secondary)] text-xs">
            Funcionando normalmente
          </p>
        </div>

        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-[var(--sidebar-text-secondary)]/40 transition-all hover:shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--sidebar-text-secondary)] text-sm font-semibold uppercase tracking-wider">
              Inativas
            </h3>
            <AlertCircle size={20} className="text-[var(--sidebar-text-secondary)] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-4xl font-bold text-[var(--sidebar-text-secondary)] mb-1">
            {inactiveApps}
          </p>
          <p className="text-[var(--sidebar-text-secondary)] text-xs">
            Aguardando ativação
          </p>
        </div>

        <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-red-500/40 transition-all hover:shadow-lg group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--sidebar-text-secondary)] text-sm font-semibold uppercase tracking-wider">
              Com Erro
            </h3>
            <XCircle size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-4xl font-bold text-red-500 mb-1">
            {errorApps}
          </p>
          <p className="text-[var(--sidebar-text-secondary)] text-xs">
            Requer atenção imediata
          </p>
        </div>
      </div>

      {/* Aplicações do Cliente */}
      <div className="bg-[var(--page-bg-secondary)] p-8 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--sidebar-text)] mb-1">
              Aplicações Integradas
            </h2>
            <p className="text-sm text-[var(--sidebar-text-secondary)]">
              Gerencie e monitore todas as aplicações conectadas
            </p>
          </div>
          <div className="px-4 py-2 bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 rounded-xl">
            <span className="text-[var(--brand-blue)] font-semibold text-sm">
              {client.apps.length} {client.apps.length === 1 ? 'App' : 'Apps'}
            </span>
          </div>
        </div>
        <ClientIntegrationApps apps={client.apps} />
      </div>
    </div>
  );
}
