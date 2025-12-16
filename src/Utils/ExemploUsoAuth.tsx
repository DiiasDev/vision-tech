/**
 * EXEMPLO DE USO - Como usar os dados do usuário logado em formulários
 * 
 * Este arquivo demonstra como preencher automaticamente o campo "Criado por"
 * com o nome do usuário logado ao criar um orçamento ou documento.
 */

import { useState, useEffect } from "react";
import { getLoggedUserFullName, getLoggedUserData } from "../Utils/AuthUtils";

interface OrcamentoForm {
  cliente: string;
  valor: number;
  descricao: string;
  criadoPor: string; // Este campo será preenchido automaticamente
  dataCriacao: string;
}

export function ExemploFormularioOrcamento() {
  const [form, setForm] = useState<OrcamentoForm>({
    cliente: "",
    valor: 0,
    descricao: "",
    criadoPor: "", // Será preenchido automaticamente
    dataCriacao: new Date().toISOString(),
  });

  // Preenche automaticamente o campo "criadoPor" quando o componente é montado
  useEffect(() => {
    const userData = getLoggedUserData();
    if (userData) {
      setForm((prev) => ({
        ...prev,
        criadoPor: userData.fullName,
      }));
    }
  }, []);

  // Ou você pode usar diretamente ao criar/salvar:
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orcamento = {
      ...form,
      criadoPor: getLoggedUserFullName(), // Garante que sempre pegue o valor atual
    };

    console.log("Orçamento criado:", orcamento);
    // Aqui você enviaria para a API
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Cliente</label>
        <input
          type="text"
          value={form.cliente}
          onChange={(e) => setForm({ ...form, cliente: e.target.value })}
        />
      </div>

      <div>
        <label>Valor</label>
        <input
          type="number"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
        />
      </div>

      <div>
        <label>Descrição</label>
        <textarea
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
      </div>

      {/* Campo "Criado por" - somente leitura, preenchido automaticamente */}
      <div>
        <label>Criado por</label>
        <input
          type="text"
          value={form.criadoPor}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
      </div>

      <button type="submit">Criar Orçamento</button>
    </form>
  );
}

// EXEMPLOS DE USO DIRETO:

// 1. Ao criar um novo documento
export function criarNovoDocumento() {
  const novoDocumento = {
    titulo: "Documento teste",
    conteudo: "...",
    criadoPor: getLoggedUserFullName(), // Preenche automaticamente
    dataCriacao: new Date(),
  };

  return novoDocumento;
}

// 2. Em uma função de API
export async function salvarOrcamento(dados: any) {
  const payload = {
    ...dados,
    criado_por: getLoggedUserFullName(),
    email_criador: getLoggedUserData()?.email,
    username_criador: getLoggedUserData()?.username,
  };

  // await api.post("/orcamentos", payload);
  console.log("Salvando:", payload);
}
