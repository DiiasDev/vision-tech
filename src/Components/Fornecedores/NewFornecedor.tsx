import FormComponent from "../../Components/FormComponent/FormComponent";
import { frappe } from "../../Services/frappeClient";
import { fornecedoresFields } from "../../Fields/FornecedoresFields";

export default function NewFornecedor() {
  const handleSubmit = async (data: any) => {
    try {
      const response = await frappe.post("/resource/Fornecedores", data);
      alert("Fornecedor cadastrado com sucesso!");
      console.log("Fornecedor criado:", response.data.data);
    } catch (error: any) {
      console.error("Erro ao cadastrar fornecedor:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erro desconhecido";
      alert("Erro ao cadastrar fornecedor: " + errorMessage);
      throw error; 
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-8 px-8">
      <FormComponent 
        doctype="Fornecedores" 
        fields={fornecedoresFields}
        title="Criar Fornecedor"
        subtitle="Preencha os dados abaixo para cadastrar um novo fornecedor no sistema"
        onSubmit={handleSubmit}
      />
    </div>
  );
}