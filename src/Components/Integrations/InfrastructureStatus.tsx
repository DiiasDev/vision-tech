import { type InfrastructureStatus as InfraStatus } from "../../types/integrations.types";
import { Globe, Database, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Clock } from "lucide-react";

interface Props {
  infrastructure: InfraStatus[];
}

const errorReasonLabels = {
  payment_overdue: "Pagamento em Atraso",
  maintenance: "Em Manutenção",
  server_error: "Erro no Servidor",
  configuration_error: "Erro de Configuração",
  resource_limit: "Limite de Recursos Atingido",
  none: "Sem Erros",
};

export function InfrastructureStatus({ infrastructure }: Props) {
  const getStatusIcon = (status: InfraStatus["status"]) => {
    switch (status) {
      case "running":
        return <CheckCircle2 size={24} className="text-green-500" />;
      case "stopped":
        return <XCircle size={24} className="text-red-500" />;
      case "error":
        return <AlertTriangle size={24} className="text-red-500" />;
    }
  };

  const getStatusColor = (status: InfraStatus["status"]) => {
    switch (status) {
      case "running":
        return "border-green-500/30 bg-green-500/5";
      case "stopped":
        return "border-red-500/30 bg-red-500/5";
      case "error":
        return "border-red-500/30 bg-red-500/5";
    }
  };

  const getStatusLabel = (status: InfraStatus["status"]) => {
    switch (status) {
      case "running":
        return "Em Execução";
      case "stopped":
        return "Parado";
      case "error":
        return "Com Erro";
    }
  };

  const getTypeIcon = (type: InfraStatus["type"]) => {
    return type === "website" ? (
      <Globe size={28} className="text-[var(--brand-blue)]" />
    ) : (
      <Database size={28} className="text-[var(--brand-blue)]" />
    );
  };

  const getTypeLabel = (type: InfraStatus["type"]) => {
    return type === "website" ? "Site / Aplicação Web" : "Banco de Dados";
  };

  return (
    <div className="space-y-4">
      {infrastructure.map((infra, index) => (
        <div
          key={index}
          className={`bg-[var(--page-bg-secondary)] border rounded-2xl p-6 transition-all hover:shadow-lg ${getStatusColor(
            infra.status
          )}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--brand-blue)]/10 rounded-xl border border-[var(--brand-blue)]/20">
                {getTypeIcon(infra.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)] mb-1">
                  {getTypeLabel(infra.type)}
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(infra.status)}
                  <span className={`font-medium text-sm ${
                    infra.status === "running" ? "text-green-500" : "text-red-500"
                  }`}>
                    {getStatusLabel(infra.status)}
                  </span>
                </div>
              </div>
            </div>

            {infra.uptime && infra.status === "running" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <TrendingUp size={16} className="text-green-500" />
                <span className="text-green-500 font-semibold text-sm">
                  Uptime: {infra.uptime}
                </span>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-[var(--sidebar-text-secondary)]">
              <Clock size={16} />
              <span>Última verificação: {infra.lastCheck}</span>
            </div>
          </div>

          {/* Mensagem de erro ou motivo */}
          {infra.status !== "running" && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-500 font-semibold text-sm mb-2">
                    ⚠️ Ação Necessária - {infra.errorReason && infra.errorReason !== "none"
                      ? errorReasonLabels[infra.errorReason]
                      : "Problema Crítico"}
                  </h4>
                  {infra.errorMessage && (
                    <p className="text-red-400/90 text-sm leading-relaxed mb-2">
                      {infra.errorMessage}
                    </p>
                  )}
                  {!infra.errorMessage && (
                    <p className="text-red-400/90 text-sm mb-2">
                      O serviço do cliente está indisponível. Verifique os logs do sistema e entre em contato com o cliente.
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-red-500/20">
                    <p className="text-red-400/70 text-xs font-medium">
                      💡 Próximos passos: {infra.errorReason === "payment_overdue" 
                        ? "Contatar financeiro do cliente e suspender serviços se necessário."
                        : "Verificar logs do servidor, reiniciar serviços ou escalar para equipe técnica."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informação quando está rodando */}
          {infra.status === "running" && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-500 text-sm font-medium">
                    ✅ Sistema operacional - Todas as verificações automáticas passaram. Nenhuma ação necessária no momento.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
