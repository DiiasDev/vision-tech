import FormComponent from "../../Components/FormComponent/FormComponent";
import { frappe } from "../../Services/frappeClient";
import { clienteFields } from "../../Fields/ClientsFields";
import AlertComponent from "../Alert/AlertComponent";
import { useAlert } from "../../hooks/useAlert";

export default function NovoCliente() {
  const { alert, showSuccess, showError, closeAlert } = useAlert();

  const handleSubmit = async (data: any) => {
    try {
      const response = await frappe.post("/resource/Clientes", data);
      showSuccess("Cliente cadastrado com sucesso!");
      console.log("Cliente criado:", response.data.data);
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erro desconhecido";
      showError("Erro ao cadastrar cliente: " + errorMessage);
      throw error;
    }
  };

  return (
    <>
      <div className="flex justify-center items-start min-h-screen py-8 px-8">
        <FormComponent 
          doctype="Clientes" 
          fields={clienteFields}
          title="Criar Cliente"
          subtitle="Preencha os dados abaixo para cadastrar um novo cliente no sistema"
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
