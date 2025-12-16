import { useNavigate } from "react-router-dom";
import {type  ServiceItem } from "../../../types/services.types";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import { ServiceDetails } from "./ServiceDetails";
import { ServiceErrorBox } from "./ServiceErrorBox";

interface Props {
  service: ServiceItem;
}

export function ServiceCard({ service }: Props) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/integracoes/backend/${service.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-[var(--page-bg-secondary)] p-5 rounded-xl border border-[var(--sidebar-divider)] cursor-pointer hover:border-[var(--brand-blue)]/50 transition-all hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--sidebar-text)]">
            {service.name}
          </h3>
          <p className="text-xs text-[var(--sidebar-text-secondary)] capitalize">
            {service.type}
          </p>
        </div>

        <ServiceStatusBadge status={service.status} />
      </div>

      <ServiceDetails service={service} />

      {service.status === "error" && service.error && (
        <ServiceErrorBox error={service.error} />
      )}
    </div>
  );
}
