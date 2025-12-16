import { type IntegrationApp } from "../../types/integrations.types";
import { StatusBadge } from "./StatusBadge";
import { Box, Calendar } from "lucide-react";

interface Props {
  apps: IntegrationApp[];
}

export function ClientIntegrationApps({ apps }: Props) {
  return (
    <div className="space-y-3">
      {apps.map((app) => (
        <div
          key={app.id}
          className="flex items-center justify-between p-4 rounded-xl bg-[var(--page-bg-secondary)] border border-[var(--sidebar-divider)] hover:border-[var(--brand-blue)]/30 transition-all group hover:shadow-md"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2.5 bg-[var(--brand-blue)]/10 rounded-lg group-hover:bg-[var(--brand-blue)]/20 transition-colors border border-[var(--brand-blue)]/20">
              <Box size={20} className="text-[var(--brand-blue)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--sidebar-text)] mb-1 group-hover:text-[var(--brand-blue)] transition-colors">
                {app.name}
              </p>
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
      ))}
    </div>
  );
}
