import React, { useState, useEffect, useMemo } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { Upload, X } from "lucide-react";

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Inicializar tema na montagem do componente
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

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

  // Tema MUI customizado - recriado quando isDarkMode muda
  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: isDarkMode ? "#60a5fa" : "#3b82f6",
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
            color: isDarkMode ? "#f9fafb !important" : "#1f2937 !important",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.15) !important" : "rgba(29, 78, 216, 0.08) !important",
            },
            "&.Mui-selected": {
              backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.2) !important" : "rgba(29, 78, 216, 0.12) !important",
              color: isDarkMode ? "#ffffff !important" : "#1f2937 !important",
              "&:hover": {
                backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.25) !important" : "rgba(29, 78, 216, 0.16) !important",
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
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: isDarkMode ? "#d1d5db !important" : "#6b7280 !important",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
            },
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "#1e2530" : "#ffffff",
            borderTop: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
            padding: "16px",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            color: isDarkMode ? "#60a5fa !important" : "#1d4ed8 !important",
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "0.875rem",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(29, 78, 216, 0.08)",
            },
          },
        },
      },
    },
  }), [isDarkMode]);

  // Controle centralizado de mudança de valores
  const handleChange = (fieldname: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldname]: value }));
  };

  // Manipular upload de imagem
  const handleImageUpload = (fieldname: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        handleChange(fieldname, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover imagem
  const handleRemoveImage = (fieldname: string) => {
    setImagePreview(null);
    handleChange(fieldname, null);
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
              sx={{
                color: isDarkMode ? "#f9fafb !important" : "#1f2937 !important",
                "& .MuiSelect-select": {
                  color: isDarkMode ? "#f9fafb !important" : "#1f2937 !important",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: isDarkMode ? "#1e2530" : "#ffffff",
                    maxHeight: 300,
                    boxShadow: isDarkMode 
                      ? "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)"
                      : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    "& .MuiList-root": {
                      padding: "8px",
                      bgcolor: isDarkMode ? "#1e2530" : "#ffffff",
                    },
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                <span style={{ 
                  color: isDarkMode ? "#9ca3af !important" : "#6b7280 !important",
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
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <DatePicker
              value={value ? dayjs(value) : null}
              onChange={(newValue: Dayjs | null) => {
                handleChange(field.fieldname, newValue ? newValue.format("YYYY-MM-DD") : "");
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  required: field.required,
                  variant: "outlined",
                },
                actionBar: {
                  actions: ["clear", "today", "accept"],
                },
                popper: {
                  sx: {
                    "& .MuiPaper-root": {
                      backgroundColor: isDarkMode ? "#1e2530" : "#ffffff",
                      boxShadow: isDarkMode 
                        ? "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)"
                        : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    },
                    "& .MuiPickersDay-root": {
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(29, 78, 216, 0.08)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: isDarkMode ? "#3b82f6 !important" : "#1d4ed8 !important",
                        color: "#ffffff !important",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#2563eb !important" : "#1e40af !important",
                        },
                      },
                    },
                    "& .MuiPickersCalendarHeader-root": {
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
                    },
                    "& .MuiPickersCalendarHeader-label": {
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
                      fontWeight: 500,
                    },
                    "& .MuiPickersCalendarHeader-switchViewButton": {
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
                    },
                    "& .MuiDayCalendar-weekDayLabel": {
                      color: isDarkMode ? "#9ca3af" : "#6b7280",
                      fontWeight: 600,
                    },
                    "& .MuiPickersYear-yearButton": {
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(29, 78, 216, 0.08)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: isDarkMode ? "#3b82f6 !important" : "#1d4ed8 !important",
                        color: "#ffffff !important",
                      },
                    },
                    "& .MuiPickersMonth-monthButton": {
                      color: isDarkMode ? "#f9fafb" : "#1f2937",
                      "&:hover": {
                        backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "rgba(29, 78, 216, 0.08)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: isDarkMode ? "#3b82f6 !important" : "#1d4ed8 !important",
                        color: "#ffffff !important",
                      },
                    },
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                },
              }}
            />
          </LocalizationProvider>
        );

      case "Attach Image":
        return (
          <Box className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              id={`upload-${field.fieldname}`}
              style={{ display: "none" }}
              onChange={(e) => handleImageUpload(field.fieldname, e)}
            />
            
            {imagePreview || value ? (
              <Box className="relative inline-block">
                <Avatar
                  src={imagePreview || value}
                  alt="Preview"
                  sx={{
                    width: 120,
                    height: 120,
                    border: isDarkMode ? "3px solid #374151" : "3px solid #e5e7eb",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(field.fieldname)}
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    backgroundColor: isDarkMode ? "#ef4444" : "#dc2626",
                    color: "white",
                    "&:hover": {
                      backgroundColor: isDarkMode ? "#dc2626" : "#b91c1c",
                    },
                  }}
                >
                  <X size={16} />
                </IconButton>
              </Box>
            ) : (
              <label htmlFor={`upload-${field.fieldname}`}>
                <Box
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  sx={{
                    borderColor: isDarkMode ? "#374151" : "#d1d5db",
                    backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
                    "&:hover": {
                      borderColor: isDarkMode ? "#60a5fa" : "#3b82f6",
                      backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.05)",
                    },
                  }}
                >
                  <Upload size={32} className="mx-auto mb-2" style={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }} />
                  <p className="text-sm" style={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}>
                    Clique para fazer upload da imagem
                  </p>
                  <p className="text-xs mt-1" style={{ color: isDarkMode ? "#6b7280" : "#9ca3af" }}>
                    PNG, JPG, GIF até 10MB
                  </p>
                </Box>
              </label>
            )}
          </Box>
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
