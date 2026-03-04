"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#e9edf6] px-4 py-8">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute -top-28 -left-28 h-72 w-72 rounded-full bg-[#294f9c]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-[#16347a]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#2d5ab3]/10 blur-3xl" />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_35px_90px_-35px_rgba(28,53,118,0.55)] backdrop-blur-sm sm:p-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2f60bd] via-[#4a7ad4] to-[#1f3f82]" />
        <div className="absolute top-5 left-6 text-[#23488f] animate-pulse">
          <span className="text-2xl leading-none">≡</span>
        </div>
        <div className="absolute top-8 right-8 hidden h-14 w-14 rounded-full border border-[#24498f]/20 bg-gradient-to-br from-[#f3f7ff] to-[#d9e5fb] md:block" />

        <div className="grid items-center gap-10 pt-8 md:grid-cols-[1.1fr_1fr] md:pt-4">
          <div className="relative mx-auto h-[260px] w-full max-w-[430px] md:h-[320px]">
            <div className="absolute top-8 left-10 h-52 w-52 rounded-full bg-gradient-to-br from-slate-50 to-slate-200" />
            <svg
              viewBox="0 0 430 320"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="Ilustracao de cabo desconectado"
            >
              <path
                d="M16 285 V250 C16 237 26 226 39 226 H119 C132 226 142 216 142 203 V170"
                fill="none"
                stroke="#23488f"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M221 96 V58 C221 45 231 35 244 35 H323"
                fill="none"
                stroke="#23488f"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <g className="lamp-swing">
                <path
                  d="M184 35 V88"
                  fill="none"
                  stroke="#23488f"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <rect x="171" y="88" width="28" height="12" rx="3" fill="#1f417f" />
                <rect x="167" y="100" width="36" height="18" rx="4" fill="#2b58a8" />
              </g>
              <g className="plug-float">
                <rect x="138" y="153" width="34" height="24" rx="5" fill="#2b58a8" />
                <rect x="146" y="143" width="4" height="10" rx="2" fill="#1c356d" />
                <rect x="160" y="143" width="4" height="10" rx="2" fill="#1c356d" />
                <path
                  d="M155 177 V226"
                  fill="none"
                  stroke="#23488f"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
              <g className="spark-left">
                <path d="M116 149 l-8 -5" stroke="#3d69be" strokeWidth="3" strokeLinecap="round" />
                <path d="M108 161 l-10 0" stroke="#3d69be" strokeWidth="3" strokeLinecap="round" />
                <path d="M118 173 l-7 5" stroke="#3d69be" strokeWidth="3" strokeLinecap="round" />
              </g>
              <g className="spark-right">
                <path d="M192 149 l8 -5" stroke="#3d69be" strokeWidth="3" strokeLinecap="round" />
                <path d="M202 161 l10 0" stroke="#3d69be" strokeWidth="3" strokeLinecap="round" />
                <path d="M193 173 l7 5" stroke="#3d69be" strokeWidth="3" strokeLinecap="round" />
              </g>
              <circle className="pulse-ring" cx="155" cy="165" r="22" fill="none" stroke="#3d69be" strokeWidth="2" />
            </svg>
          </div>

          <div className="text-center md:text-left">
            <p className="content-rise text-xs font-semibold tracking-[0.24em] text-[#2f60bd] uppercase">
              Erro de Navegacao
            </p>
            <h1 className="title-drop mt-1 text-7xl font-extrabold tracking-tight text-[#23488f] drop-shadow-[0_10px_24px_rgba(35,72,143,0.2)] sm:text-8xl">
              404
            </h1>
            <h2 className="content-rise mt-2 text-3xl font-bold text-slate-800 sm:text-[2.1rem]">
              Page Not Found
            </h2>
            <p className="content-rise mt-3 max-w-md text-base leading-relaxed text-slate-500">
              A página que você tentou acessar não foi encontrada. Ela pode ter sido movida,
              removida ou nunca existiu.
            </p>
            <div className="content-rise mt-8 flex flex-col items-center gap-4 md:items-start">
              <Link
                href="/"
                className="inline-flex rounded-full bg-gradient-to-r from-[#1f4385] to-[#295ab3] px-9 py-3 text-sm font-semibold tracking-wide text-white transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-[#23488f]/30"
              >
                GO HOME
              </Link>
              <span className="text-xs text-slate-400">
                Dica: confira se o endereco digitado esta correto.
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .lamp-swing {
          transform-origin: 184px 35px;
          animation: swing 3.4s ease-in-out infinite;
        }

        .plug-float {
          animation: float 2.8s ease-in-out infinite;
        }

        .spark-left {
          animation: spark 1.4s ease-in-out infinite;
        }

        .spark-right {
          animation: spark 1.4s ease-in-out 0.2s infinite;
        }

        .pulse-ring {
          transform-origin: center;
          animation: pulse-ring 2.2s ease-out infinite;
        }

        .title-drop {
          animation: title-drop 700ms cubic-bezier(0.2, 1, 0.3, 1) both;
        }

        .content-rise {
          animation: content-rise 800ms ease both;
        }

        .bg-grid {
          background-image:
            linear-gradient(to right, rgba(33, 67, 133, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(33, 67, 133, 0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(circle at center, black 35%, transparent 90%);
        }

        @keyframes swing {
          0%,
          100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes spark {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes pulse-ring {
          0% {
            opacity: 0.7;
            transform: scale(0.9);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        @keyframes title-drop {
          from {
            opacity: 0;
            transform: translateY(-18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes content-rise {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
