import { servicesMock } from "./services.mock";
import { ServicesSummaryCards } from "./ServicesSummaryCards";
import { ServiceCard } from "./ServiceCard";
import { Server, TrendingUp } from "lucide-react";

export default function ServicesDashboard() {
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
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Monitoramento de aplicações, serviços e infraestrutura
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
            <TrendingUp size={18} className="text-green-500" />
            <span className="text-green-500 font-semibold text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <ServicesSummaryCards data={servicesMock} />

      {/* Seção de serviços */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--sidebar-text)] mb-2">Serviços Ativos</h2>
          <p className="text-sm text-[var(--sidebar-text-secondary)]">
            Gerencie e monitore todos os serviços e aplicações backend
          </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {servicesMock.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
}
