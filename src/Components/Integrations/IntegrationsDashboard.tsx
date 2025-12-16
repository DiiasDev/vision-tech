import { useState, useMemo } from "react";
import { integrationsMock } from "./integrations.mock";
import { IntegrationSummaryCards } from "./IntegrationSummaryCards";
import { ClientIntegrationCard } from "./ClientIntegrationCard";
import { Plug, TrendingUp, Search, Filter, X } from "lucide-react";

export default function IntegrationsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredClients = useMemo(() => {
    return integrationsMock.filter((client) => {
      const matchesSearch = client.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header aprimorado */}
      <div className="bg-[var(--page-bg-secondary)] p-8 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-[var(--brand-blue)]/10 rounded-xl border border-[var(--brand-blue)]/20">
              <Plug size={32} className="text-[var(--brand-blue)]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[var(--sidebar-text)] mb-2 tracking-tight">
                Integrações
              </h1>
              <p className="text-base text-[var(--sidebar-text-secondary)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Central de controle e monitoramento de clientes
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
      <IntegrationSummaryCards data={integrationsMock} />

      {/* Seção de clientes */}
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--sidebar-text)] mb-2">Clientes Integrados</h2>
              <p className="text-sm text-[var(--sidebar-text-secondary)]">
                Gerencie e monitore o status de todos os seus clientes
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--sidebar-hover)] hover:bg-[var(--sidebar-active-bg)] border border-[var(--sidebar-divider)] rounded-xl transition-all text-[var(--sidebar-text)] text-sm font-medium"
              >
                <X size={16} />
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Busca por nome */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--sidebar-icon)]" />
              <input
                type="text"
                placeholder="Buscar cliente por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[var(--page-bg-secondary)] border border-[var(--sidebar-divider)] rounded-xl text-[var(--sidebar-text)] placeholder-[var(--sidebar-text-secondary)] focus:outline-none focus:border-[var(--brand-blue)] transition-colors"
              />
            </div>

            {/* Filtro por status */}
            <div className="sm:w-64">
              <div className="relative">
                <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--sidebar-icon)] pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--page-bg-secondary)] border border-[var(--sidebar-divider)] rounded-xl text-[var(--sidebar-text)] focus:outline-none focus:border-[var(--brand-blue)] transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Apenas Ativos</option>
                  <option value="inactive">Apenas Inativos</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-[var(--sidebar-icon)]">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados */}
          {filteredClients.length > 0 ? (
            <div className="mb-4">
              <p className="text-sm text-[var(--sidebar-text-secondary)]">
                {filteredClients.length} {filteredClients.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
              </p>
            </div>
          ) : (
            <div className="bg-[var(--page-bg-secondary)] border border-[var(--sidebar-divider)] rounded-xl p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-[var(--sidebar-hover)] rounded-full">
                  <Search size={32} className="text-[var(--sidebar-icon)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
                  Nenhum cliente encontrado
                </h3>
                <p className="text-sm text-[var(--sidebar-text-secondary)] max-w-md">
                  Não há clientes que correspondam aos filtros selecionados. Tente ajustar sua busca ou limpar os filtros.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredClients.map((client) => (
            <ClientIntegrationCard key={client.id} client={client} />
          ))}
        </div>
      </div>
    </div>
  );
}
