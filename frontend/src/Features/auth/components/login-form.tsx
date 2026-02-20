"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert, CircleCheck, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { saveAuthSession } from "@/lib/auth-session"
// import { ThemeToggle } from "@/components/shared/theme-toggle"

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
    <Card className="w-full max-w-md border-border shadow-2xl">
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          Acessar conta
        </h2>
        {/* <ThemeToggle /> */}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {feedback && (
            <Alert variant={feedback.type === "error" ? "destructive" : "success"}>
              {feedback.type === "error" ? <CircleAlert /> : <CircleCheck />}
              <AlertTitle>
                {feedback.type === "error" ? "Erro ao entrar" : "Sucesso"}
              </AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 relative">
            <Label>Senha</Label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember">Lembrar-me</Label>
            </div>

            <button
              type="button"
              className="text-secondary hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <span className="text-secondary cursor-pointer hover:underline">
              Criar conta
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
