"use client"

import Link from "next/link"

export default function BuildPage() {
  return (
    <div className="relative min-h-[72vh] overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-background via-background to-muted/35 p-4 sm:p-6 lg:p-8">
      <div className="bp-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-chart-2/15 blur-3xl" />

      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative mx-auto h-[280px] w-full max-w-[560px] sm:h-[340px] lg:h-[390px]">
          <svg
            viewBox="0 0 600 390"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Ilustracao de interface em construcao"
          >
            <rect x="78" y="48" width="438" height="248" rx="22" fill="color-mix(in oklab, var(--card) 96%, black 4%)" />
            <rect x="78" y="48" width="438" height="36" rx="22" fill="color-mix(in oklab, var(--primary) 18%, var(--card) 82%)" />
            <circle cx="104" cy="66" r="5" fill="var(--primary)" />
            <circle cx="122" cy="66" r="5" fill="var(--chart-2)" />
            <circle cx="140" cy="66" r="5" fill="var(--chart-1)" />

            <rect x="108" y="106" width="118" height="162" rx="14" fill="color-mix(in oklab, var(--muted) 72%, var(--card) 28%)" />
            <rect x="244" y="106" width="242" height="48" rx="12" fill="color-mix(in oklab, var(--muted) 70%, var(--card) 30%)" />
            <rect x="244" y="170" width="242" height="26" rx="10" fill="color-mix(in oklab, var(--muted) 78%, var(--card) 22%)" />
            <rect x="244" y="208" width="146" height="26" rx="10" fill="color-mix(in oklab, var(--muted) 78%, var(--card) 22%)" />

            <g className="bp-scaffold-left">
              <rect x="92" y="92" width="8" height="190" rx="4" fill="var(--primary)" />
              <rect x="92" y="92" width="148" height="8" rx="4" fill="var(--primary)" />
              <rect x="92" y="142" width="148" height="7" rx="3.5" fill="var(--chart-1)" />
              <rect x="92" y="190" width="148" height="7" rx="3.5" fill="var(--chart-1)" />
            </g>

            <g className="bp-crane-arm">
              <rect x="384" y="18" width="9" height="114" rx="4.5" fill="var(--primary)" />
              <rect x="338" y="18" width="126" height="10" rx="5" fill="var(--primary)" />
              <line x1="442" y1="28" x2="442" y2="146" stroke="var(--primary)" strokeWidth="3.5" />
              <rect x="430" y="146" width="24" height="20" rx="5" fill="var(--chart-2)" />
            </g>

            <g className="bp-dropped-card">
              <rect x="282" y="188" width="132" height="52" rx="12" fill="color-mix(in oklab, var(--chart-2) 62%, var(--primary) 38%)" />
              <rect x="296" y="204" width="68" height="10" rx="5" fill="color-mix(in oklab, var(--card) 86%, white 14%)" />
              <rect x="296" y="218" width="94" height="8" rx="4" fill="color-mix(in oklab, var(--card) 84%, white 16%)" />
            </g>

            <g className="bp-shimmer-lines">
              <rect x="244" y="252" width="172" height="10" rx="5" fill="color-mix(in oklab, var(--muted) 72%, var(--card) 28%)" />
              <rect x="244" y="268" width="210" height="10" rx="5" fill="color-mix(in oklab, var(--muted) 72%, var(--card) 28%)" />
            </g>

            <g className="bp-gear-spin">
              <circle cx="530" cy="118" r="22" fill="color-mix(in oklab, var(--primary) 22%, transparent)" />
              <circle cx="530" cy="118" r="11" fill="var(--primary)" />
              <rect x="528.5" y="88" width="3" height="10" rx="1.5" fill="var(--primary)" />
              <rect x="528.5" y="138" width="3" height="10" rx="1.5" fill="var(--primary)" />
              <rect x="500" y="116.5" width="10" height="3" rx="1.5" fill="var(--primary)" />
              <rect x="550" y="116.5" width="10" height="3" rx="1.5" fill="var(--primary)" />
            </g>

            <g className="bp-cone-bounce">
              <path d="M120 324 l-14 36 h28 z" fill="var(--chart-1)" />
              <rect x="102" y="360" width="36" height="8" rx="4" fill="color-mix(in oklab, var(--foreground) 28%, var(--muted) 72%)" />
            </g>

            <g className="bp-cone-bounce-delayed">
              <path d="M172 324 l-14 36 h28 z" fill="var(--chart-2)" />
              <rect x="154" y="360" width="36" height="8" rx="4" fill="color-mix(in oklab, var(--foreground) 28%, var(--muted) 72%)" />
            </g>
          </svg>
        </div>

        <div className="text-center lg:text-left">
          <span className="bp-badge inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Area em construcao
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Estamos construindo
            <span className="block bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
              esta funcionalidade
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
            Esse modulo ainda nao esta pronto. O time esta montando os componentes da tela,
            conectando dados e finalizando os fluxos para liberar em breve.
          </p>

          <div className="mt-7 space-y-3 rounded-2xl border border-border/70 bg-card/80 p-4">
            <StatusRow label="Estrutura da interface" done />
            <StatusRow label="Integracao com dados" />
            <StatusRow label="Regras de negocio e validacoes" />
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/"
              className="inline-flex rounded-full bg-gradient-to-r from-primary to-chart-1 px-7 py-3 text-sm font-semibold tracking-wide text-primary-foreground transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Voltar para Home
            </Link>
            <span className="text-xs text-muted-foreground">Estamos atualizando esta area continuamente.</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bp-grid {
          background-image:
            linear-gradient(to right, color-mix(in oklab, var(--primary) 10%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in oklab, var(--primary) 10%, transparent) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at center, black 34%, transparent 88%);
        }

        .bp-badge {
          animation: bp-pulse 2.2s ease-in-out infinite;
        }

        .bp-scaffold-left {
          animation: bp-float 2.8s ease-in-out infinite;
        }

        .bp-crane-arm {
          animation: bp-crane 2.1s ease-in-out infinite;
        }

        .bp-dropped-card {
          animation: bp-drop-card 2.6s ease-in-out infinite;
        }

        .bp-shimmer-lines {
          animation: bp-shimmer 1.8s linear infinite;
        }

        .bp-gear-spin {
          transform-origin: 530px 118px;
          animation: bp-spin 4.5s linear infinite;
        }

        .bp-cone-bounce {
          animation: bp-cone 1.8s ease-in-out infinite;
        }

        .bp-cone-bounce-delayed {
          animation: bp-cone 1.8s ease-in-out 0.3s infinite;
        }

        @keyframes bp-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bp-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 color-mix(in oklab, var(--primary) 20%, transparent);
          }
          50% {
            box-shadow: 0 0 0 10px color-mix(in oklab, var(--primary) 0%, transparent);
          }
        }

        @keyframes bp-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes bp-crane {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }

        @keyframes bp-drop-card {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          30% {
            transform: translateY(-26px) scale(0.97);
          }
          55% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bp-shimmer {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes bp-cone {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  )
}

function StatusRow({ label, done = false }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/65 px-3 py-2 text-sm">
      <span className="text-foreground/90">{label}</span>
      <span
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
          done ? "bg-chart-2/18 text-chart-2" : "bg-primary/12 text-primary"
        }`}
      >
        {done ? "feito" : "em andamento"}
      </span>
    </div>
  )
}
