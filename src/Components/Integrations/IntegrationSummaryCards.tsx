import { type ClientIntegration } from "../../types/integrations.types";
import { Users, CheckCircle2, Layers } from "lucide-react";

interface Props {
  data: ClientIntegration[];
}

export function IntegrationSummaryCards({ data }: Props) {
  const totalClients = data.length;
  const activeClients = data.filter(c => c.status === "active").length;
  const totalApps = data.reduce((acc, c) => acc + c.apps.length, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card Clientes */}
      <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-[var(--brand-blue)]/40 transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-[var(--brand-blue)]/10 rounded-xl group-hover:scale-110 transition-transform border border-[var(--brand-blue)]/20">
            <Users size={24} className="text-[var(--brand-blue)]" />
          </div>
        </div>
        <p className="text-sm text-[var(--sidebar-text-secondary)] font-medium uppercase tracking-wider mb-1">
          Clientes
        </p>
        <p className="text-4xl font-bold text-[var(--sidebar-text)] mb-2">{totalClients}</p>
        <p className="text-xs text-[var(--sidebar-text-secondary)]">Total cadastrado no sistema</p>
      </div>

      {/* Card Clientes Ativos */}
      <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-green-500/40 transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform border border-green-500/20">
            <CheckCircle2 size={24} className="text-green-500" />
          </div>
          <div className="px-3 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
            <span className="text-green-500 text-xs font-bold">
              {totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0}%
            </span>
          </div>
        </div>
        <p className="text-sm text-[var(--sidebar-text-secondary)] font-medium uppercase tracking-wider mb-1">
          Clientes Ativos
        </p>
        <p className="text-4xl font-bold text-green-500 mb-2">{activeClients}</p>
        <p className="text-xs text-[var(--sidebar-text-secondary)]">Com integração ativa</p>
      </div>

      {/* Card Aplicações */}
      <div className="bg-[var(--page-bg-secondary)] p-6 rounded-2xl border border-[var(--sidebar-divider)] hover:border-[var(--brand-blue-light)]/40 transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-[var(--brand-blue)]/10 rounded-xl group-hover:scale-110 transition-transform border border-[var(--brand-blue)]/20">
            <Layers size={24} className="text-[var(--brand-blue-light)]" />
          </div>
          <div className="px-3 py-1 bg-[var(--brand-blue)]/10 rounded-lg border border-[var(--brand-blue)]/20">
            <span className="text-[var(--brand-blue-light)] text-xs font-bold">
              {totalClients > 0 ? Math.round(totalApps / totalClients * 10) / 10 : 0} / cliente
            </span>
          </div>
        </div>
        <p className="text-sm text-[var(--sidebar-text-secondary)] font-medium uppercase tracking-wider mb-1">
          Aplicações Integradas
        </p>
        <p className="text-4xl font-bold text-[var(--brand-blue-light)] mb-2">{totalApps}</p>
        <p className="text-xs text-[var(--sidebar-text-secondary)]">Apps conectados ao sistema</p>
      </div>
    </div>
  );
}
