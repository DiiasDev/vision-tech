import { type ServiceItem } from "../../../types/services.types";

interface Props {
  service: ServiceItem;
}

export function ServiceDetails({ service }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 mt-3">
      <div>
        <span className="font-medium text-gray-300">Ambiente:</span>{" "}
        {service.environment}
      </div>
      <div>
        <span className="font-medium text-gray-300">Uptime:</span>{" "}
        {service.uptime}
      </div>
      <div>
        <span className="font-medium text-gray-300">Versão:</span>{" "}
        {service.version || "—"}
      </div>
      <div>
        <span className="font-medium text-gray-300">Último check:</span>{" "}
        {service.lastCheck}
      </div>
    </div>
  );
}
