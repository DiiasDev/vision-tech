import { type IntegrationApp } from "../../types/integrations.types";
import { StatusBadge } from "./StatusBadge";
import { Box, Calendar, AlertCircle } from "lucide-react";

interface Props {
  apps: IntegrationApp[];
  onErrorClick?: (app: IntegrationApp) => void;
}

export function ClientIntegrationApps({ apps, onErrorClick }: Props) {
  return (
    <div className="space-y-3">
      {apps.map((app) => {
        const hasError = app.status === "error" && app.errorDetails;
        const isClickable = hasError && onErrorClick;

        return (
          <div
            key={app.id}
            onClick={() => isClickable && onErrorClick(app)}
            className={`flex items-center justify-between p-4 rounded-xl bg-[var(--page-bg-secondary)] border border-[var(--sidebar-divider)] transition-all group hover:shadow-md ${
              isClickable
                ? "cursor-pointer hover:border-red-500/40 hover:bg-red-500/5"
                : "hover:border-[var(--brand-blue)]/30"
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-2.5 rounded-lg transition-colors border ${
                hasError 
                  ? "bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20" 
                  : "bg-[var(--brand-blue)]/10 border-[var(--brand-blue)]/20 group-hover:bg-[var(--brand-blue)]/20"
              }`}>
                <Box size={20} className={hasError ? "text-red-500" : "text-[var(--brand-blue)]"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold mb-1 transition-colors ${
                    hasError 
                      ? "text-[var(--sidebar-text)] group-hover:text-red-500" 
                      : "text-[var(--sidebar-text)] group-hover:text-[var(--brand-blue)]"
                  }`}>
                    {app.name}
                  </p>
                  {hasError && (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                      <AlertCircle size={14} />
                      Clique para ver detalhes
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--sidebar-text-secondary)]">
                  <span className="px-2 py-0.5 bg-[var(--sidebar-hover)] rounded border border-[var(--sidebar-divider)] font-mono">
                    {app.version}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {app.lastUpdate}
                  </span>
                </div>
              </div>
            </div>

            <StatusBadge status={app.status} />
          </div>
        );
      })}
    </div>
  );
}
