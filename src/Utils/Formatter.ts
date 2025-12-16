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

export const formatDateTime = (dateString?: string) => {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return dateString;
    
    // Formata para DD/MM/YYYY HH:MM
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
};