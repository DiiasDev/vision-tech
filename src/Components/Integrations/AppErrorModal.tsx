import { X, AlertTriangle, Clock, Code, Wrench, ListChecks } from "lucide-react";
import { type AppErrorDetails } from "../../types/integrations.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  appVersion: string;
  errorDetails: AppErrorDetails;
}

const errorReasonLabels = {
  payment_overdue: "Pagamento em Atraso",
  maintenance: "Em Manutenção",
  server_error: "Erro no Servidor",
  configuration_error: "Erro de Configuração",
  resource_limit: "Limite de Recursos",
  none: "Indefinido",
};

export function AppErrorModal({ isOpen, onClose, appName, appVersion, errorDetails }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modal-appear">
      <div className="bg-[var(--page-bg-secondary)] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-[var(--sidebar-divider)]">
        {/* Header */}
        <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--sidebar-text)] mb-1">
                Detalhes do Erro
              </h2>
              <p className="text-sm text-[var(--sidebar-text-secondary)]">
                {appName} <span className="text-xs font-mono bg-[var(--sidebar-hover)] px-2 py-1 rounded">{appVersion}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--sidebar-hover)] rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={24} className="text-[var(--sidebar-icon)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
          {/* Código e Categoria do Erro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--page-bg)] p-4 rounded-xl border border-[var(--sidebar-divider)]">
              <div className="flex items-center gap-2 mb-2">
                <Code size={18} className="text-red-500" />
                <h3 className="font-semibold text-[var(--sidebar-text)] text-sm">Código do Erro</h3>
              </div>
              <p className="font-mono text-red-500 text-lg font-bold">{errorDetails.errorCode}</p>
            </div>

            <div className="bg-[var(--page-bg)] p-4 rounded-xl border border-[var(--sidebar-divider)]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h3 className="font-semibold text-[var(--sidebar-text)] text-sm">Categoria</h3>
              </div>
              <p className="text-red-500 text-lg font-bold">
                {errorReasonLabels[errorDetails.errorReason]}
              </p>
            </div>
          </div>

          {/* Momento do Erro */}
          <div className="bg-[var(--page-bg)] p-4 rounded-xl border border-[var(--sidebar-divider)]">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-[var(--sidebar-icon)]" />
              <h3 className="font-semibold text-[var(--sidebar-text)] text-sm">Ocorrido em</h3>
            </div>
            <p className="text-[var(--sidebar-text)] font-medium">{errorDetails.occurredAt}</p>
          </div>

          {/* Descrição do Erro */}
          <div className="bg-red-500/5 p-5 rounded-xl border border-red-500/20">
            <h3 className="font-semibold text-[var(--sidebar-text)] mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Descrição do Problema
            </h3>
            <p className="text-[var(--sidebar-text)] leading-relaxed">
              {errorDetails.errorMessage}
            </p>
          </div>

          {/* Funcionalidades Afetadas */}
          {errorDetails.affectedFeatures && errorDetails.affectedFeatures.length > 0 && (
            <div className="bg-[var(--page-bg)] p-5 rounded-xl border border-[var(--sidebar-divider)]">
              <h3 className="font-semibold text-[var(--sidebar-text)] mb-3 flex items-center gap-2">
                <ListChecks size={18} className="text-[var(--sidebar-icon)]" />
                Funcionalidades Afetadas
              </h3>
              <ul className="space-y-2">
                {errorDetails.affectedFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-[var(--sidebar-text-secondary)]"
                  >
                    <span className="text-red-500 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ação Sugerida */}
          <div className="bg-blue-500/10 p-5 rounded-xl border border-blue-500/20">
            <h3 className="font-semibold text-[var(--sidebar-text)] mb-3 flex items-center gap-2">
              <Wrench size={18} className="text-blue-500" />
              Ação Recomendada
            </h3>
            <p className="text-[var(--sidebar-text)] leading-relaxed whitespace-pre-line">
              {errorDetails.suggestedAction}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--sidebar-divider)] p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--sidebar-hover)] hover:bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text)] rounded-xl transition-colors font-medium"
          >
            Fechar
          </button>
          <button
            className="px-6 py-2.5 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/80 text-white rounded-xl transition-colors font-medium"
            onClick={() => {
              // Aqui você pode adicionar lógica para copiar detalhes ou abrir documentação
              console.log("Ação de resolução");
            }}
          >
            Copiar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
