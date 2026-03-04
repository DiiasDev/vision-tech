function onlyDigits(value?: string | null) {
  if (!value) return ""
  return value.replace(/\D/g, "")
}

export function formatCpf(value?: string | null) {
  const digits = onlyDigits(value)
  if (digits.length !== 11) return value ?? ""
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function formatCnpj(value?: string | null) {
  const digits = onlyDigits(value)
  if (digits.length !== 14) return value ?? ""
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

export function formatCpfCnpj(value?: string | null) {
  const digits = onlyDigits(value)
  if (digits.length === 11) return formatCpf(digits)
  if (digits.length === 14) return formatCnpj(digits)
  return value ?? ""
}

export function formatPhoneBR(value?: string | null) {
  const digits = onlyDigits(value)
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  return value ?? ""
}

type CurrencyValue = number | string | null | undefined

function toNumber(value: CurrencyValue) {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim()) return Number(value.replace(",", "."))
  return Number.NaN
}

export function formatCurrencyBR(value: CurrencyValue, options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }) {
  const numericValue = toNumber(value)
  if (Number.isNaN(numericValue)) return "R$ 0,00"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(numericValue)
}

export function formatPriceOrCostBR(value: CurrencyValue) {
  return formatCurrencyBR(value)
}
