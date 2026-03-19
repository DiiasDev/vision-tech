"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert, CircleCheck, Eye, EyeOff, Loader2 } from "lucide-react"
import { FaApple, FaFacebookF, FaGoogle } from "react-icons/fa"
import { saveAuthSession } from "@/lib/auth-session"

type FeedbackState = {
  type: "success" | "error"
  message: string
} | null

type LoginResponse = {
  success?: boolean
  message?: string | string[]
  accessToken?: string
  user?: {
    id: string
    name: string
    email: string
    role?: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback

  const maybeMessage = (payload as { message?: unknown }).message
  if (typeof maybeMessage === "string" && maybeMessage.trim()) {
    return maybeMessage
  }

  if (Array.isArray(maybeMessage) && maybeMessage.length > 0) {
    return String(maybeMessage[0])
  }

  return fallback
}

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      let payload: unknown = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }

      const loginPayload = payload as LoginResponse | null

      if (!response.ok || loginPayload?.success === false) {
        setFeedback({
          type: "error",
          message: getApiMessage(payload, "Nao foi possivel realizar login."),
        })
        return
      }

      if (loginPayload?.accessToken) {
        saveAuthSession(loginPayload.accessToken, loginPayload.user ?? null)
      }

      setFeedback({
        type: "success",
        message: getApiMessage(payload, "Login realizado com sucesso."),
      })
      router.replace("/dashboard")
    } catch {
      setFeedback({
        type: "error",
        message: "Erro de conexao com o servidor.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[430px] text-[#131d2e]">
      <div className="mb-10 lg:mb-12">
        <h1 className="text-5xl leading-[0.96] font-extrabold tracking-[-0.03em] md:text-6xl">
          Bem-vindo de volta!
        </h1>
        <p className="mt-5 max-w-[400px] text-lg leading-[1.55] text-[#6c7483] md:text-[21px]">
          Simplifique seu fluxo de trabalho e potencialize sua gestão com o <span className="font-semibold text-[#131d2e]">Byncode</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedback.type === "error" ? <CircleAlert size={16} /> : <CircleCheck size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <input
          type="email"
          placeholder="Usuário ou Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-14 w-full rounded-full border border-[#cfd6df] bg-transparent px-7 text-base text-[#2a3344] placeholder:text-[#a0a9b6] outline-none transition focus:border-[#a9b3c2] md:h-[58px]"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-14 w-full rounded-full border border-[#cfd6df] bg-transparent px-7 pr-14 text-base text-[#2a3344] placeholder:text-[#a0a9b6] outline-none transition focus:border-[#a9b3c2] md:h-[58px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-[#8f98a7] transition hover:text-[#2a3344]"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
          </button>
        </div>

        <div className="-mt-1 flex justify-end">
          <button type="button" className="text-sm text-[#1d2433] hover:underline md:text-base">
            Esqueceu a senha?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-14 w-full items-center justify-center rounded-full bg-black text-lg font-semibold text-white shadow-[0_10px_16px_rgba(0,0,0,0.18)] transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-75 md:h-[58px]"
        >
          {loading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
          Entrar
        </button>

        <div className="flex items-center gap-4 pt-2">
          <div className="h-px flex-1 bg-[#d8dde3]" />
          <span className="text-sm text-[#a0a7b3]">ou continue com</span>
          <div className="h-px flex-1 bg-[#d8dde3]" />
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white transition hover:scale-[1.03]"
            aria-label="Entrar com Google"
          >
            <FaGoogle size={18} />
          </button>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white transition hover:scale-[1.03]"
            aria-label="Entrar com Apple"
          >
            <FaApple size={20} />
          </button>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white transition hover:scale-[1.03]"
            aria-label="Entrar com Facebook"
          >
            <FaFacebookF size={18} />
          </button>
        </div>

        <p className="pt-2 text-center text-[18px] text-[#5f6776] md:text-[20px]">
          Não é membro?{" "}
          <button type="button" className="font-semibold text-[#189349] hover:underline">
            Registre-se agora
          </button>
        </p>
      </form>
    </div>
  )
}
