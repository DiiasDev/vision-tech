import {type ServiceItem } from "../../../types/services.types";
import { PlayCircle, PauseCircle, XCircle } from "lucide-react";

interface Props {
  data: ServiceItem[];
}

export function ServicesSummaryCards({ data }: Props) {
  const running = data.filter(s => s.status === "running").length;
  const stopped = data.filter(s => s.status === "stopped").length;
  const errors = data.filter(s => s.status === "error").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card Serviços Rodando */}
      <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-green-500/40 transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform border border-green-500/20">
            <PlayCircle size={24} className="text-green-500" />
          </div>
        </div>
        <p className="text-sm text-[var(--sidebar-text-secondary)] font-medium uppercase tracking-wider mb-1">
          Serviços Rodando
        </p>
        <p className="text-4xl font-bold text-green-500 mb-2">{running}</p>
        <p className="text-xs text-[var(--sidebar-text-secondary)]">Operacionais no momento</p>
      </div>

      {/* Card Serviços Parados */}
      <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-yellow-500/40 transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:scale-110 transition-transform border border-yellow-500/20">
            <PauseCircle size={24} className="text-yellow-500" />
          </div>
        </div>
        <p className="text-sm text-[var(--sidebar-text-secondary)] font-medium uppercase tracking-wider mb-1">
          Serviços Parados
        </p>
        <p className="text-4xl font-bold text-yellow-500 mb-2">{stopped}</p>
        <p className="text-xs text-[var(--sidebar-text-secondary)]">Aguardando inicialização</p>
      </div>

      {/* Card Com Erro */}
      <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-red-500/40 transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform border border-red-500/20">
            <XCircle size={24} className="text-red-500" />
          </div>
        </div>
        <p className="text-sm text-[var(--sidebar-text-secondary)] font-medium uppercase tracking-wider mb-1">
          Com Erro
        </p>
        <p className="text-4xl font-bold text-red-500 mb-2">{errors}</p>
        <p className="text-xs text-[var(--sidebar-text-secondary)]">Requer atenção imediata</p>
      </div>
    </div>
  );
}
