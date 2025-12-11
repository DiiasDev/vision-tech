import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

type Field = {
  fieldname: string;
  label: string;
  fieldtype: string;
  required?: boolean;
  options?: string[] | string;
  section?: string;
};

type FormComponentProps = {
  doctype: string;
  fields: Field[];
  initialData?: Record<string, any>;
  onSubmit?: (data: any) => void;
  title?: string;
  subtitle?: string;
};

const FormComponent: React.FC<FormComponentProps> = ({
  doctype,
  fields,
  initialData = {},
  onSubmit,
  title,
  subtitle,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Observar mudanças no dark mode
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

  // Tema MUI customizado
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
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
            },
            "&.Mui-focused": {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: isDarkMode ? "#60a5fa" : "#1d4ed8",
              borderWidth: "2px",
            },
          },
          notchedOutline: {
            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.23)",
          },
          input: {
            color: isDarkMode ? "#f9fafb" : "#1f2937",
            "&::placeholder": {
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              opacity: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: isDarkMode ? "#d1d5db" : "#6b7280",
            "&.Mui-focused": {
              color: isDarkMode ? "#60a5fa" : "#1d4ed8",
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            color: isDarkMode ? "#f9fafb" : "#1f2937",
          },
          icon: {
            color: isDarkMode ? "#d1d5db" : "#6b7280",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: isDarkMode ? "#f9fafb" : "#1f2937",
            backgroundColor: isDarkMode ? "#1e2530" : "#ffffff",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(29, 78, 216, 0.08)",
            },
            "&.Mui-selected": {
              backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.15)" : "rgba(29, 78, 216, 0.12)",
              "&:hover": {
                backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(29, 78, 216, 0.16)",
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "#1e2530" : "#ffffff",
            backgroundImage: "none",
          },
        },
      },
    },
  });

  // Controle centralizado de mudança de valores
  const handleChange = (fieldname: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldname]: value }));
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      setLoading(true);
      try {
        await onSubmit(formData);
        setFormData({}); // Limpar formulário após sucesso
      } catch (error) {
        // Erro será tratado pelo componente pai
      } finally {
        setLoading(false);
      }
    }
  };

  // Renderização dinâmica por tipo
  const renderField = (field: Field) => {
    const value = formData[field.fieldname] || "";

    switch (field.fieldtype) {
      case "Select":
        const options = Array.isArray(field.options)
          ? field.options
          : String(field.options || "").split("\n").filter(Boolean);
        
        return (
          <FormControl fullWidth size="small">
            <Select
              value={value}
              onChange={(e) => handleChange(field.fieldname, e.target.value)}
              displayEmpty
              required={field.required}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: isDarkMode ? "#1e2530" : "#ffffff",
                    maxHeight: 300,
                    "& .MuiList-root": {
                      padding: "8px",
                    },
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                <span style={{ 
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                  fontStyle: "italic",
                }}>
                  Selecione...
                </span>
              </MenuItem>
              {options.map((opt) => (
                <MenuItem 
                  key={opt} 
                  value={opt}
                  sx={{
                    borderRadius: "6px",
                    marginBottom: "2px",
                  }}
                >
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "Check":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleChange(field.fieldname, e.target.checked ? 1 : 0)}
                sx={{
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                  "&.Mui-checked": {
                    color: isDarkMode ? "#60a5fa" : "#1d4ed8",
                  },
                }}
              />
            }
            label=""
          />
        );

      case "Small Text":
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
            variant="outlined"
            size="small"
          />
        );

      case "Int":
      case "Float":
        return (
          <TextField
            fullWidth
            type="number"
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
            variant="outlined"
            size="small"
            inputProps={{
              step: field.fieldtype === "Float" ? "0.01" : "1",
            }}
          />
        );

      case "Date":
        return (
          <TextField
            fullWidth
            type="date"
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& input[type='date']::-webkit-calendar-picker-indicator": {
                filter: isDarkMode ? "invert(1)" : "invert(0)",
                cursor: "pointer",
              },
            }}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            type="text"
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
            variant="outlined"
            size="small"
          />
        );
    }
  };

  // Agrupar campos por seção
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || "default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, Field[]>);

  // Definir layout por seção (full = largura completa, half = meia largura)
  const sectionLayout: Record<string, 'full' | 'half'> = {
    "Informações Básicas": "full",
    "Contatos": "half",
    "Endereço": "half",
    "default": "full"
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white dark:bg-[#1e2530] p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {/* Cabeçalho */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            {title || `Criar ${doctype}`}
          </h2>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>

        {/* Seções de campos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(groupedFields).map(([section, sectionFields]) => {
            const layout = sectionLayout[section] || "full";
            const colSpan = layout === "full" ? "lg:col-span-2" : "lg:col-span-1";
            
            return (
              <div key={section} className={`space-y-6 ${colSpan}`}>
                {section !== "default" && (
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4 pb-2 border-b border-gray-300 dark:border-gray-600">
                    {section}
                  </h3>
                )}
                <div className={`grid ${layout === 'full' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                  {sectionFields.map((field) => (
                    <div key={field.fieldname} className={`flex flex-col gap-2 ${field.fieldtype === 'Small Text' ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                      <label className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {field.label}
                        {field.required && <span className="text-red-500 dark:text-red-400"> *</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão de submit */}
        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </ThemeProvider>
  );
};

export default FormComponent;
