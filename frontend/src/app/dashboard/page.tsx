import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, DollarSign, Package, TrendingUp, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const metrics: MetricCardProps[] = [
  {
    title: "Receita do Mes",
    value: "R$ 24.500",
    hint: "+8.2% vs mes anterior",
    icon: DollarSign,
    premium: true,
  },
  {
    title: "Produtos em Estoque",
    value: "128",
    hint: "12 itens com giro alto",
    icon: Package,
  },
  {
    title: "Clientes Ativos",
    value: "42",
    hint: "5 novos na ultima semana",
    icon: Users,
  },
  {
    title: "Crescimento",
    value: "+12%",
    hint: "Meta mensal em andamento",
    icon: TrendingUp,
  },
]

const quickActions = [
  "Criar proposta comercial",
  "Abrir ordem de servico",
  "Registrar conta a receber",
  "Atualizar niveis de estoque",
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-muted/55 p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute -left-10 -top-14 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 top-0 h-36 w-36 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Visao geral</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Painel estrategico da operacao</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Monitore as principais frentes da empresa em um unico lugar e avance de forma orientada por dados.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-border/70 bg-card/85 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Fluxo financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/35 text-sm text-muted-foreground">
              Grafico financeiro (em breve)
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/85 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Atalhos rapidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-left text-sm transition-colors hover:border-primary/35 hover:bg-primary/5"
              >
                <span>{action}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/70 bg-card/85">
        <CardHeader>
          <CardTitle>Atividade recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/25 p-5 text-sm text-muted-foreground">
            Nenhuma atividade recente.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type MetricCardProps = {
  title: string
  value: string
  hint: string
  icon: LucideIcon
  premium?: boolean
}

function MetricCard({ title, value, hint, icon: Icon, premium = false }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/70 bg-gradient-to-b from-card to-muted/50">
      {premium && (
        <Badge className="absolute right-3 top-3 bg-accent text-accent-foreground hover:bg-accent">
          Premium
        </Badge>
      )}

      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold leading-none tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}
