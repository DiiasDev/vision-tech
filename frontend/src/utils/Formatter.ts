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
