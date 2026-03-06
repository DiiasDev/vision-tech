"use client"

import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

type InfoStockProps = {
  open: boolean
  onClose: () => void
  title: string
  description: string
  details: string[]
}

export function InfoStock({ open, onClose, title, description, details }: InfoStockProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Informacoes sobre ${title}`}
    >
      <div
        className="w-full max-w-lg rounded-2xl border bg-background p-5 shadow-2xl md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>

          <Button type="button" variant="outline" size="icon-sm" onClick={onClose} aria-label="Fechar modal de informacao do estoque">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        <ul className="space-y-2 text-sm text-foreground">
          {details.map((detail) => (
            <li key={detail} className="rounded-lg border bg-card/70 px-3 py-2">
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
