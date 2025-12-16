import { type ServiceStatus } from "../../../types/services.types";

interface Props {
  status: ServiceStatus;
}

export function ServiceStatusBadge({ status }: Props) {
  const styles = {
    running: "bg-green-500/20 text-green-400",
    stopped: "bg-yellow-500/20 text-yellow-400",
    error: "bg-red-500/20 text-red-400",
  };

  const labels = {
    running: "Rodando",
    stopped: "Parado",
    error: "Erro",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
