"use client"

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"

export type ComponentAlertType = "info" | "success" | "error" | "warning"

export type ComponentAlertState = {
  type: ComponentAlertType
  title: string
  message: string
  actionLabel: string
}

const alertDefaultMessages: Record<ComponentAlertType, string> = {
  info: "Tudo parece estar em ordem.",
  success: "Cadastro realizado com sucesso.",
  error: "Nao foi possivel concluir o cadastro.",
  warning: "Revise os dados informados antes de continuar.",
}

export class ComponentAlert {
  static Success(msg = ""): ComponentAlertState {
    return {
      type: "success",
      title: "Sucesso!",
      message: msg || alertDefaultMessages.success,
      actionLabel: "Fechar",
    }
  }

  static Error(msg = ""): ComponentAlertState {
    return {
      type: "error",
      title: "Erro!",
      message: msg || alertDefaultMessages.error,
      actionLabel: "Tentar novamente",
    }
  }

  static Info(msg = ""): ComponentAlertState {
    return {
      type: "info",
      title: "Heads up!",
      message: msg || alertDefaultMessages.info,
      actionLabel: "Dispensar",
    }
  }

  static Warning(msg = ""): ComponentAlertState {
    return {
      type: "warning",
      title: "Atencao!",
      message: msg || alertDefaultMessages.warning,
      actionLabel: "Revisar",
    }
  }
}

const variantStyles: Record<
  ComponentAlertType,
  {
    container: string
    icon: string
    title: string
    message: string
    button: string
    Icon: typeof Info
  }
> = {
  info: {
    container: "border-l-4 border-blue-600 bg-blue-50/80",
    icon: "text-blue-600",
    title: "text-blue-800",
    message: "text-blue-700",
    button: "border-blue-300/80 text-blue-700 hover:bg-blue-100",
    Icon: Info,
  },
  success: {
    container: "border-l-4 border-emerald-600 bg-emerald-50/80",
    icon: "text-emerald-600",
    title: "text-emerald-800",
    message: "text-emerald-700",
    button: "border-emerald-300/80 text-emerald-700 hover:bg-emerald-100",
    Icon: CheckCircle2,
  },
  error: {
    container: "border-l-4 border-red-600 bg-red-50/80",
    icon: "text-red-600",
    title: "text-red-800",
    message: "text-red-700",
    button: "border-red-300/80 text-red-700 hover:bg-red-100",
    Icon: AlertCircle,
  },
  warning: {
    container: "border-l-4 border-amber-600 bg-amber-50/80",
    icon: "text-amber-600",
    title: "text-amber-800",
    message: "text-amber-700",
    button: "border-amber-300/80 text-amber-700 hover:bg-amber-100",
    Icon: AlertTriangle,
  },
}

type AlertComponentProps = {
  alert: ComponentAlertState | null
  onClose?: () => void
  className?: string
}

export function AlertComponent({ alert, onClose, className }: AlertComponentProps) {
  if (!alert) return null

  const style = variantStyles[alert.type]
  const Icon = style.Icon

  return (
    <div
      role="alert"
      className={cn(
        "w-full rounded-xl px-4 py-3 shadow-sm sm:px-5 sm:py-4",
        "flex items-start justify-between gap-4",
        style.container,
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.icon)} />
        <div className="min-w-0">
          <p className={cn("text-base font-semibold", style.title)}>{alert.title}</p>
          <p className={cn("mt-0.5 text-sm break-words", style.message)}>{alert.message}</p>
        </div>
      </div>

      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
            style.button
          )}
        >
          {alert.actionLabel}
        </button>
      ) : null}
    </div>
  )
}
