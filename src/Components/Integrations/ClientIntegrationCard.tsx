import { useNavigate } from "react-router-dom";
import { type ClientIntegration } from "../../types/integrations.types";
import { StatusBadge } from "./StatusBadge";
import { ClientIntegrationApps } from "./ClientIntegrationApps";

interface Props {
  client: ClientIntegration;
}

export function ClientIntegrationCard({ client }: Props) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/integracoes/clientes/${client.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-[var(--page-bg-secondary)] p-5 rounded-xl border border-[var(--sidebar-divider)] cursor-pointer hover:border-[var(--brand-blue)]/50 transition-all hover:shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
            {client.clientName}
          </h3>
          <p className="text-xs text-[var(--sidebar-text-secondary)]">
            Última sincronização: {client.lastSync}
          </p>
        </div>

        <StatusBadge status={client.status} />
      </div>

      <ClientIntegrationApps apps={client.apps} />
    </div>
  );
}
