import { Globe, Server, Shield, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface WebsiteInfo {
  url: string;
  domain: string;
  hosting: string;
  sslStatus: "active" | "expired" | "none";
}

interface Props {
  website: WebsiteInfo;
}

export function WebsiteInformation({ website }: Props) {
  const getSSLBadge = () => {
    switch (website.sslStatus) {
      case "active":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-green-500 text-xs font-semibold">SSL Ativo</span>
          </div>
        );
      case "expired":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
            <XCircle size={16} className="text-red-500" />
            <span className="text-red-500 text-xs font-semibold">SSL Expirado</span>
          </div>
        );
      case "none":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--sidebar-hover)] border border-[var(--sidebar-divider)] rounded-lg">
            <AlertTriangle size={16} className="text-[var(--sidebar-text-secondary)]" />
            <span className="text-[var(--sidebar-text-secondary)] text-xs font-semibold">Sem SSL</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-[var(--page-bg-secondary)] p-8 rounded-2xl border border-[var(--sidebar-divider)] shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--brand-blue)]/10 rounded-xl border border-[var(--brand-blue)]/20">
            <Globe size={24} className="text-[var(--brand-blue)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--sidebar-text)] mb-1">
              Informações do Site
            </h2>
            <p className="text-sm text-[var(--sidebar-text-secondary)]">
              Detalhes de hospedagem e domínio
            </p>
          </div>
        </div>
        {getSSLBadge()}
      </div>

      <div className="space-y-4">
        {/* URL do Site */}
        <div className="flex items-center justify-between p-5 bg-[var(--page-bg)] rounded-xl border border-[var(--sidebar-divider)] hover:border-[var(--brand-blue)]/30 transition-all group">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2.5 bg-[var(--brand-blue)]/10 rounded-lg border border-[var(--brand-blue)]/20">
              <Globe size={20} className="text-[var(--brand-blue)]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--sidebar-text-secondary)] font-semibold uppercase tracking-wider mb-1">
                URL do Site
              </p>
              <a 
                href={website.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--brand-blue)] font-medium hover:underline flex items-center gap-2"
              >
                {website.url}
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Domínio */}
        <div className="flex items-center justify-between p-5 bg-[var(--page-bg)] rounded-xl border border-[var(--sidebar-divider)]">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Globe size={20} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--sidebar-text-secondary)] font-semibold uppercase tracking-wider mb-1">
                Domínio
              </p>
              <p className="text-[var(--sidebar-text)] font-semibold font-mono">
                {website.domain}
              </p>
            </div>
          </div>
        </div>

        {/* Hospedagem */}
        <div className="flex items-center justify-between p-5 bg-[var(--page-bg)] rounded-xl border border-[var(--sidebar-divider)]">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Server size={20} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--sidebar-text-secondary)] font-semibold uppercase tracking-wider mb-1">
                Hospedagem
              </p>
              <p className="text-[var(--sidebar-text)] font-semibold">
                {website.hosting}
              </p>
            </div>
          </div>
        </div>

        {/* Status SSL */}
        <div className="flex items-center justify-between p-5 bg-[var(--page-bg)] rounded-xl border border-[var(--sidebar-divider)]">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-2.5 rounded-lg border ${
              website.sslStatus === "active" 
                ? "bg-green-500/10 border-green-500/20" 
                : website.sslStatus === "expired"
                ? "bg-red-500/10 border-red-500/20"
                : "bg-[var(--sidebar-hover)] border-[var(--sidebar-divider)]"
            }`}>
              <Shield size={20} className={
                website.sslStatus === "active" 
                  ? "text-green-500" 
                  : website.sslStatus === "expired"
                  ? "text-red-500"
                  : "text-[var(--sidebar-text-secondary)]"
              } />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--sidebar-text-secondary)] font-semibold uppercase tracking-wider mb-1">
                Certificado SSL
              </p>
              <div className="flex items-center gap-3">
                <p className={`font-semibold ${
                  website.sslStatus === "active" 
                    ? "text-green-500" 
                    : website.sslStatus === "expired"
                    ? "text-red-500"
                    : "text-[var(--sidebar-text-secondary)]"
                }`}>
                  {website.sslStatus === "active" ? "Ativo e Válido" : website.sslStatus === "expired" ? "Expirado - Renovação Necessária" : "Não Configurado"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta se SSL expirado */}
      {website.sslStatus === "expired" && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-500 font-semibold text-sm mb-1">
                ⚠️ Ação Urgente Necessária
              </h4>
              <p className="text-red-400/90 text-sm leading-relaxed">
                O certificado SSL está expirado. O site pode estar exibindo avisos de segurança para visitantes.
              </p>
              <div className="mt-3 pt-3 border-t border-red-500/20">
                <p className="text-red-400/70 text-xs font-medium">
                  💡 Próximos passos: Renovar o certificado SSL imediatamente via painel de hospedagem ou Let's Encrypt.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
