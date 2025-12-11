export const formatCPF = (cpf?: string) => {
  if (!cpf) return null;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatCNPJ = (cnpj?: string) => {
  if (!cnpj) return null;
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

export const formatPhone = (phone?: string) => {
  if (!phone) return null;
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
};

export const formatCEP = (cep?: string) => {
  if (!cep) return null;
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
};