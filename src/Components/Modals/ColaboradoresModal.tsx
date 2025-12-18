import { useState, useEffect } from "react";
import { type Colaborador } from "../../types/Colaboradores.types";
import { formatCPF, formatPhone } from "../../Utils/Formatter";
import { TextField, Select, MenuItem, FormControl } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const getStatusLabel = (status?: string) => {
  if (status === "Ativo") return "Ativo";
  if (status === "Inativo") return "Inativo";
  if (status === "Afastado") return "Afastado";
  return "Pendente";
};

const getStatusColor = (status?: string) => {
  if (status === "Ativo") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (status === "Inativo") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  if (status === "Afastado") return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
};

export default function ColaboradorModal({
  open,
  onClose,
  colaborador,
  isEditMode = false,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  colaborador: Colaborador | null;
  isEditMode?: boolean;
  onSave?: (data: Colaborador) => Promise<void>;
}) {
  const [editMode, setEditMode] = useState(isEditMode);
  const [formData, setFormData] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (colaborador) {
      setFormData({ ...colaborador });
    }
    setEditMode(isEditMode);
  }, [colaborador, isEditMode]);

  if (!open || !colaborador || !formData) return null;

  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
      },
      background: {
        paper: isDarkMode ? "#1e2530" : "#ffffff",
        default: isDarkMode ? "#0f1419" : "#f9fafb",
      },
      text: {
        primary: isDarkMode ? "#f9fafb" : "#1f2937",
        secondary: isDarkMode ? "#d1d5db" : "#6b7280",
      },
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
            color: isDarkMode ? "#f9fafb" : "#1f2937",
          },
          notchedOutline: {
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.23)",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: isDarkMode ? "#d1d5db" : "#6b7280",
          },
        },
      },
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!onSave || !formData) return;
    
    setLoading(true);
    try {
      await onSave(formData);
      setEditMode(false);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar colaborador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-[#0f1419] border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">
                  {editMode ? "Editar Colaborador" : formData.nome_completo}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getStatusColor(formData.status)}`}>
                    {getStatusLabel(formData.status)}
                  </span>
                  {formData.cargo && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                      {formData.cargo}
                    </span>
                  )}
                  {formData.tipo_colaborador && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                      {formData.tipo_colaborador}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {!editMode && onSave && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all"
                    aria-label="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all"
                  aria-label="Fechar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-[#0a0e13]">
          {/* Dados Pessoais */}
          <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                Dados Pessoais
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {editMode ? (
                <>
                  <EditField label="Nome Completo" value={formData.nome_completo} onChange={(v) => handleChange("nome_completo", v)} required />
                  <EditField label="CPF" value={formData.cpf} onChange={(v) => handleChange("cpf", v)} />
                  <EditField label="Data de Nascimento" value={formData.data_nascimento} onChange={(v) => handleChange("data_nascimento", v)} type="date" />
                  <EditField 
                    label="Sexo" 
                    value={formData.sexo} 
                    onChange={(v) => handleChange("sexo", v)}
                    type="select"
                    options={["Masculino", "Feminino", "Outro"]}
                  />
                  <EditField 
                    label="Estado Civil" 
                    value={formData.estado_civil} 
                    onChange={(v) => handleChange("estado_civil", v)}
                    type="select"
                    options={["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"]}
                  />
                </>
              ) : (
                <>
                  <InfoItem label="CPF" value={formatCPF(formData.cpf)} />
                  <InfoItem label="Data de Nascimento" value={formData.data_nascimento ? new Date(formData.data_nascimento).toLocaleDateString('pt-BR') : undefined} />
                  <InfoItem label="Sexo" value={formData.sexo} />
                  <InfoItem label="Estado Civil" value={formData.estado_civil} />
                  {formData.codigo_colaborador && (
                    <InfoItem label="Código" value={formData.codigo_colaborador} />
                  )}
                </>
              )}
            </div>
          </section>

          {/* Contato */}
          <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                Contato
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {editMode ? (
                <>
                  <EditField label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} type="email" />
                  <EditField label="Telefone" value={formData.telefone} onChange={(v) => handleChange("telefone", v)} />
                  <EditField label="WhatsApp" value={formData.whatsapp} onChange={(v) => handleChange("whatsapp", v)} />
                  <div className="md:col-span-2">
                    <EditField label="Endereço" value={formData.endereco} onChange={(v) => handleChange("endereco", v)} />
                  </div>
                </>
              ) : (
                <>
                  <InfoItem label="Email" value={formData.email} icon="email" />
                  <InfoItem label="Telefone" value={formatPhone(formData.telefone)} icon="phone" />
                  {formData.whatsapp && (
                    <InfoItem label="WhatsApp" value={formatPhone(formData.whatsapp)} icon="whatsapp" />
                  )}
                  {formData.endereco && (
                    <InfoItem label="Endereço" value={formData.endereco} colSpan />
                  )}
                </>
              )}
            </div>
          </section>

          {/* Cargo & Função */}
          <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                Cargo & Função
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {editMode ? (
                <>
                  <EditField 
                    label="Cargo" 
                    value={formData.cargo} 
                    onChange={(v) => handleChange("cargo", v)}
                    type="select"
                    options={["Desenvolvedor", "Técnico de Manutenção", "Atendimento", "Vendas", "Administrativo", "Gerente", "Outro"]}
                    required
                  />
                  <EditField 
                    label="Tipo de Colaborador" 
                    value={formData.tipo_colaborador} 
                    onChange={(v) => handleChange("tipo_colaborador", v)}
                    type="select"
                    options={["CLT", "PJ", "Freelancer", "Parceiro"]}
                    required
                  />
                  <EditField 
                    label="Área de Atuação" 
                    value={formData.area_atuacao} 
                    onChange={(v) => handleChange("area_atuacao", v)}
                    type="select"
                    options={["Web", "Chatbot", "Manutenção", "Vendas", "Suporte"]}
                  />
                  <EditField 
                    label="Status" 
                    value={formData.status} 
                    onChange={(v) => handleChange("status", v)}
                    type="select"
                    options={["Ativo", "Inativo", "Afastado"]}
                    required
                  />
                  <div className="md:col-span-2">
                    <EditField 
                      label="Habilidades" 
                      value={formData.habilidades} 
                      onChange={(v) => handleChange("habilidades", v)}
                      type="textarea"
                    />
                  </div>
                </>
              ) : (
                <>
                  <InfoItem label="Área de Atuação" value={formData.area_atuacao} />
                  {formData.habilidades && (
                    <InfoItem label="Habilidades" value={formData.habilidades} colSpan />
                  )}
                </>
              )}
            </div>
          </section>

          {/* Dados Profissionais */}
          {(formData.data_admissao || formData.tipo_contrato || formData.salario || formData.carga_horaria || editMode) && (
            <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Dados Profissionais
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {editMode ? (
                  <>
                    <EditField label="Data de Admissão" value={formData.data_admissao} onChange={(v) => handleChange("data_admissao", v)} type="date" />
                    <EditField 
                      label="Tipo de Contrato" 
                      value={formData.tipo_contrato} 
                      onChange={(v) => handleChange("tipo_contrato", v)}
                      type="select"
                      options={["Integral", "Meio Período", "Sob Demanda"]}
                    />
                    <EditField label="Salário" value={formData.salario?.toString()} onChange={(v) => handleChange("salario", Number(v))} type="text" />
                    <EditField label="Carga Horária" value={formData.carga_horaria} onChange={(v) => handleChange("carga_horaria", v)} />
                  </>
                ) : (
                  <>
                    {formData.data_admissao && (
                      <InfoItem label="Data de Admissão" value={new Date(formData.data_admissao).toLocaleDateString('pt-BR')} />
                    )}
                    <InfoItem label="Tipo de Contrato" value={formData.tipo_contrato} />
                    {formData.salario && (
                      <InfoItem label="Salário" value={`R$ ${formData.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    )}
                    <InfoItem label="Carga Horária" value={formData.carga_horaria} />
                  </>
                )}
              </div>
            </section>
          )}

          {/* Acesso ao Sistema */}
          {(formData.usuario_sistema || formData.pode_acessar_sistema || editMode) && (
            <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Acesso ao Sistema
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {editMode ? (
                  <>
                    <EditField label="Usuário do Sistema" value={formData.usuario_sistema} onChange={(v) => handleChange("usuario_sistema", v)} />
                    <EditField 
                      label="Pode Acessar Sistema" 
                      value={formData.pode_acessar_sistema?.toString()} 
                      onChange={(v) => handleChange("pode_acessar_sistema", Number(v))}
                      type="select"
                      options={["0", "1"]}
                    />
                  </>
                ) : (
                  <>
                    <InfoItem label="Usuário do Sistema" value={formData.usuario_sistema} />
                    <InfoItem label="Pode Acessar Sistema" value={formData.pode_acessar_sistema === 1 ? "Sim" : "Não"} />
                  </>
                )}
              </div>
            </section>
          )}

          {/* Observações */}
          {(formData.observacoes || editMode) && (
            <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Observações
                </h3>
              </div>
              {editMode ? (
                <EditField 
                  label="" 
                  value={formData.observacoes} 
                  onChange={(v) => handleChange("observacoes", v)}
                  type="textarea"
                />
              ) : (
                formData.observacoes && (
                  <div className="bg-gray-50 dark:bg-[#0f1419] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {formData.observacoes}
                    </p>
                  </div>
                )
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-[#1e2530] border-t border-gray-200 dark:border-gray-800 p-5">
          {editMode ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({ ...colaborador });
                  setEditMode(false);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl py-3.5 transition-all"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold rounded-xl py-3.5 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold rounded-xl py-3.5 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}

function EditField({ 
  label, 
  value, 
  onChange,
  type = "text",
  options = [],
  required = false
}: { 
  label: string; 
  value?: string | null;
  onChange: (value: string) => void;
  type?: "text" | "email" | "select" | "textarea" | "date";
  options?: string[];
  required?: boolean;
}) {
  const isDarkMode = document.documentElement.classList.contains("dark");
  
  return (
    <div>
      {label && (
        <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
          {label}
          {required && <span className="text-red-500 dark:text-red-400"> *</span>}
        </dt>
      )}
      {type === "select" ? (
        <FormControl fullWidth size="small">
          <Select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            displayEmpty
            required={required}
            sx={{
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              color: isDarkMode ? "#f9fafb" : "#1f2937",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.23)",
              },
            }}
          >
            <MenuItem value="" disabled>
              <span style={{ color: isDarkMode ? "#9ca3af" : "#6b7280", fontStyle: "italic" }}>
                Selecione...
              </span>
            </MenuItem>
            {options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : type === "textarea" ? (
        <TextField
          fullWidth
          multiline
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              color: isDarkMode ? "#f9fafb" : "#1f2937",
            },
          }}
        />
      ) : (
        <TextField
          fullWidth
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              color: isDarkMode ? "#f9fafb" : "#1f2937",
            },
          }}
        />
      )}
    </div>
  );
}

function InfoItem({ 
  label, 
  value, 
  icon,
  colSpan = false 
}: { 
  label: string; 
  value?: string | null;
  icon?: string;
  colSpan?: boolean;
}) {
  if (!value) return null;
  
  return (
    <div className={colSpan ? "md:col-span-2" : ""}>
      <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2">
        {icon === "email" && (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        )}
        {icon === "phone" && (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        )}
        {icon === "whatsapp" && (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        )}
        <span className={icon ? "" : ""}>{value}</span>
      </dd>
    </div>
  );
}
