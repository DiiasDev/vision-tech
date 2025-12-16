import FormComponent from "../../Components/FormComponent/FormComponent";
import { fornecedoresFields } from "../../Fields/FornecedoresFields";
import { criarFornecedor } from "../../Services/fornecedores.api";
import AlertComponent from "../Alert/AlertComponent";
import { useAlert } from "../../hooks/useAlert";

export default function NewFornecedor() {
  const { alert, showSuccess, showError, closeAlert } = useAlert();

  const handleSubmit = async (data: any) => {
    try {
      criarFornecedor(data);
      showSuccess("Fornecedor cadastrado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao cadastrar fornecedor:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erro desconhecido";
      showError("Erro ao cadastrar fornecedor: " + errorMessage);
      throw error;
    }
  };

  return (
    <>
      <div className="flex justify-center items-start min-h-screen py-8 px-8">
        <FormComponent 
          doctype="Fornecedor" 
          fields={fornecedoresFields}
          title="Criar Fornecedor"
          subtitle="Preencha os dados abaixo para cadastrar um novo fornecedor no sistema"
          onSubmit={handleSubmit}
        />
      </div>
      <AlertComponent
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={closeAlert}
      />
    </>
  );
}