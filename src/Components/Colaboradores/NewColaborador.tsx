import FormComponent from "../../Components/FormComponent/FormComponent";
import { colaboradoresFields } from "../../Fields/ColaboradoresFields";
import { criarColaborador } from "../../Services/colaboradores.api";
import AlertComponent from "../Alert/AlertComponent";
import { useAlert } from "../../hooks/useAlert";

export default function NewColaborador() {
  const { alert, showSuccess, showError, closeAlert } = useAlert();

  const handleSubmit = async (data: any) => {
    try {
      criarColaborador(data);
      showSuccess("Colaborador Cadastrado Com Sucesso!");
    } catch (error: any) {
      console.error("Erro ao Cadastrar fornecedor", error);
      showError("Erro ao Cadastrar Colaborador...");
      throw error;
    }
  };

  return (
    <>
      <div className="flex justify-center items-start min-h-screen py-8 px-8">
        <FormComponent
          doctype="Fornecedor"
          fields={colaboradoresFields}
          title="Criar Colaborador"
          subtitle="Preencha os dados abaixo para cadastrar um novo Colaborador no sistema"
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
