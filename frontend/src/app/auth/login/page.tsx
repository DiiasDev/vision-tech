"use client"

import { LoginForm } from "../../../Features/auth/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex relative flex-col justify-between bg-gradient-to-br from-primary via-secondary to-primary p-12 text-white">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Vision <span className="text-accent">Tech</span>
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Sistema completo de gestão empresarial
            construído para escalar.
          </p>
        </div>

        <div className="relative z-10 text-sm text-white/70">
          © {new Date().getFullYear()} Vision Tech. Todos os direitos reservados.
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex items-center justify-center bg-background p-6">
        <LoginForm />
      </div>
    </div>
  )
}
