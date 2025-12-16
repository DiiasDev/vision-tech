import { type ServiceError } from "../../../types/services.types";

interface Props {
  error: ServiceError;
}

export function ServiceErrorBox({ error }: Props) {
  return (
    <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
      <p className="text-sm text-red-400 font-semibold">
        {error.message}
      </p>

      <p className="text-xs text-red-300 mt-1">
        Código: {error.code || "N/A"} • Última ocorrência: {error.lastOccurrence}
      </p>
    </div>
  );
}
