import React, { useState } from "react";

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
        return (
          <select
            className="w-full border rounded p-2 bg-neutralDark/10 dark:bg-neutralLight/5"
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
          >
            <option value="">Selecione...</option>
            {Array.isArray(field.options)
              ? field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)
              : String(field.options || "")
                  .split("\n")
                  .map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );

      case "Check":
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(field.fieldname, e.target.checked ? 1 : 0)}
            className="h-4 w-4"
          />
        );

      case "Small Text":
        return (
          <textarea
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
            className="w-full border rounded p-2 bg-neutralDark/10 dark:bg-neutralLight/5"
            rows={3}
          />
        );

      case "Int":
      case "Float":
        return (
          <input
            type="number"
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
            className="w-full border rounded p-2 bg-neutralDark/10 dark:bg-neutralLight/5"
          />
        );

      case "Date":
        return (
          <input
            type="date"
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
            className="w-full border rounded p-2 bg-neutralDark/10 dark:bg-neutralLight/5"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            required={field.required}
            onChange={(e) => handleChange(field.fieldname, e.target.value)}
            className="w-full border rounded p-2 bg-neutralDark/10 dark:bg-neutralLight/5"
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

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white dark:bg-neutralDark p-8 rounded-xl shadow-lg border border-neutralLight dark:border-neutralDark"
    >
      {/* Cabeçalho */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primaryDark dark:text-neutralLight mb-2">
          {title || `Criar ${doctype}`}
        </h2>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* Seções de campos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(groupedFields).map(([section, sectionFields]) => (
          <div key={section} className="space-y-6">
            {section !== "default" && (
              <h3 className="text-xl font-semibold text-primaryDark dark:text-neutralLight mb-4 pb-2 border-b border-gray-300 dark:border-gray-600">
                {section}
              </h3>
            )}
            <div className="space-y-6">
              {sectionFields.map((field) => (
                <div key={field.fieldname} className="flex flex-col gap-2">
                  <label className="font-semibold text-primaryDark dark:text-neutralLight">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botão de submit */}
      <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 bg-primary hover:bg-primaryDark text-white py-3 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default FormComponent;
