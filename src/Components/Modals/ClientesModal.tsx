import { useState, useEffect } from "react";
import { type ClienteTypes } from "../../types/Clientes.types";
import {formatCPF, formatCEP, formatCNPJ, formatPhone} from "../../Utils/Formatter"
import { TextField, Select, MenuItem, FormControl, Checkbox, FormControlLabel } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const getStatusLabel = (ativo?: number) => {
  if (ativo === 1) return "Ativo";
  if (ativo === 0) return "Inativo";
  return "Pendente";
};

const getStatusColor = (ativo?: number) => {
  if (ativo === 1) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (ativo === 0) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
};

export default function ClienteModal({
  open,
  onClose,
  cliente,
  isEditMode = false,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  cliente: ClienteTypes | null;
  isEditMode?: boolean;
  onSave?: (data: ClienteTypes) => Promise<void>;
}) {
  const [editMode, setEditMode] = useState(isEditMode);
  const [formData, setFormData] = useState<ClienteTypes | null>(null);
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
    if (cliente) {
      setFormData({ ...cliente });
    }
    setEditMode(isEditMode);
  }, [cliente, isEditMode]);

  if (!open || !cliente || !formData) return null;

  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#1d4ed8",
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
      alert("Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  };

  const enderecoCompleto = [
    formData.logradouro && formData.numero ? `${formData.logradouro}, ${formData.numero}` : formData.logradouro,
    formData.complemento,
    formData.bairro,
    formData.cidade && formData.estado ? `${formData.cidade} - ${formData.estado}` : formData.cidade || formData.estado,
    formatCEP(formData.cep)
  ].filter(Boolean).join(", ");

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
                  {editMode ? "Editar Cliente" : formData.nome}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getStatusColor(formData.ativo)}`}>
                    {getStatusLabel(formData.ativo)}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                    {formData.tipo_cliente === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                  </span>
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
          {/* Informações Básicas */}
          <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                Informações Básicas
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {editMode ? (
                <>
                  <EditField label="Nome" value={formData.nome} onChange={(v) => handleChange("nome", v)} required />
                  <EditField 
                    label="Tipo de Cliente" 
                    value={formData.tipo_cliente} 
                    onChange={(v) => handleChange("tipo_cliente", v)}
                    type="select"
                    options={["PF", "PJ"]}
                    required
                  />
                  {formData.tipo_cliente === "PF" ? (
                    <EditField label="CPF" value={formData.cpf} onChange={(v) => handleChange("cpf", v)} />
                  ) : (
                    <EditField label="CNPJ" value={formData.cnpj} onChange={(v) => handleChange("cnpj", v)} />
                  )}
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Status
                    </dt>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.ativo === 1}
                          onChange={(e) => handleChange("ativo", e.target.checked ? 1 : 0)}
                          sx={{
                            color: isDarkMode ? "#9ca3af" : "#6b7280",
                            "&.Mui-checked": {
                              color: isDarkMode ? "#60a5fa" : "#1d4ed8",
                            },
                          }}
                        />
                      }
                      label="Ativo"
                      sx={{ color: isDarkMode ? "#f9fafb" : "#1f2937" }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <EditField 
                      label="Observações" 
                      value={formData.observacoes} 
                      onChange={(v) => handleChange("observacoes", v)}
                      type="textarea"
                    />
                  </div>
                </>
              ) : (
                <>
                  <InfoItem 
                    label="Tipo de Cliente" 
                    value={formData.tipo_cliente === "PF" ? "Pessoa Física" : "Pessoa Jurídica"} 
                  />
                  <InfoItem 
                    label={formData.tipo_cliente === "PF" ? "CPF" : "CNPJ"} 
                    value={formData.tipo_cliente === "PF" ? formatCPF(formData.cpf) : formatCNPJ(formData.cnpj)} 
                  />
                  <InfoItem 
                    label="Cliente desde" 
                    value={formData.creation ? new Date(formData.creation).toLocaleDateString('pt-BR') : null}
                  />
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
                  <EditField label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} type="email" required />
                  <EditField label="Telefone" value={formData.telefone} onChange={(v) => handleChange("telefone", v)} required />
                  <EditField label="WhatsApp" value={formData.whatsapp} onChange={(v) => handleChange("whatsapp", v)} />
                </>
              ) : (
                <>
                  <InfoItem label="Email" value={formData.email} icon="email" />
                  <InfoItem label="Telefone" value={formatPhone(formData.telefone)} icon="phone" />
                  {formData.whatsapp && (
                    <InfoItem label="WhatsApp" value={formatPhone(formData.whatsapp)} icon="whatsapp" />
                  )}
                </>
              )}
            </div>
          </section>

          {/* Endereço */}
          {(enderecoCompleto || editMode) && (
            <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Endereço
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {editMode ? (
                  <>
                    <EditField label="CEP" value={formData.cep} onChange={(v) => handleChange("cep", v)} />
                    <EditField 
                      label="Tipo de Endereço" 
                      value={formData.tipo_endereco} 
                      onChange={(v) => handleChange("tipo_endereco", v)}
                      type="select"
                      options={["Principal", "Cobrança", "Entrega"]}
                    />
                    <div className="md:col-span-2">
                      <EditField label="Logradouro" value={formData.logradouro} onChange={(v) => handleChange("logradouro", v)} />
                    </div>
                    <EditField label="Número" value={formData.numero} onChange={(v) => handleChange("numero", v)} />
                    <EditField label="Complemento" value={formData.complemento} onChange={(v) => handleChange("complemento", v)} />
                    <EditField label="Bairro" value={formData.bairro} onChange={(v) => handleChange("bairro", v)} />
                    <EditField label="Cidade" value={formData.cidade} onChange={(v) => handleChange("cidade", v)} />
                    <EditField label="Estado" value={formData.estado} onChange={(v) => handleChange("estado", v)} />
                    <div className="md:col-span-2">
                      <EditField label="Referência" value={formData.referencia} onChange={(v) => handleChange("referencia", v)} />
                    </div>
                  </>
                ) : (
                  <>
                    <InfoItem label="CEP" value={formatCEP(formData.cep)} />
                    <InfoItem label="Tipo" value={formData.tipo_endereco} />
                    <InfoItem label="Logradouro" value={formData.logradouro} colSpan />
                    <InfoItem label="Número" value={formData.numero} />
                    <InfoItem label="Complemento" value={formData.complemento} />
                    <InfoItem label="Bairro" value={formData.bairro} />
                    <InfoItem label="Cidade" value={formData.cidade} />
                    <InfoItem label="Estado" value={formData.estado} />
                    {formData.referencia && (
                      <InfoItem label="Referência" value={formData.referencia} colSpan />
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Observações */}
          {formData.observacoes && !editMode && (
            <section className="bg-white dark:bg-[#1e2530] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Observações
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-[#0f1419] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {formData.observacoes}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-[#1e2530] border-t border-gray-200 dark:border-gray-800 p-5">
          {editMode ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({ ...cliente });
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
  type?: "text" | "email" | "select" | "textarea";
  options?: string[];
  required?: boolean;
}) {
  const isDarkMode = document.documentElement.classList.contains("dark");
  
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-500 dark:text-red-400"> *</span>}
      </dt>
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