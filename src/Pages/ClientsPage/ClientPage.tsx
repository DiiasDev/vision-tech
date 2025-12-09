import FormComponent from "../../Components/FormComponent/FormComponent";

const clienteFields = [
  { fieldname: "nome", label: "Nome", fieldtype: "Data", required: true, section: "Dados Pessoais" },
  { fieldname: "cpf", label: "CPF", fieldtype: "Data", section: "Dados Pessoais" },
  { fieldname: "telefone", label: "Telefone", fieldtype: "Data", section: "Dados Pessoais" },
  { fieldname: "email", label: "Email", fieldtype: "Data", section: "Dados Pessoais" },
  {
    fieldname: "tipo_cliente",
    label: "Tipo",
    fieldtype: "Select",
    options: ["PF", "PJ"],
    required: true,
    section: "Dados Pessoais"
  },
  { fieldname: "cep", label: "CEP", fieldtype: "Data", section: "Endereço" },
  { fieldname: "rua", label: "Rua", fieldtype: "Data", section: "Endereço" },
  { fieldname: "numero", label: "Número", fieldtype: "Data", section: "Endereço" },
  { fieldname: "complemento", label: "Complemento", fieldtype: "Data", section: "Endereço" },
  { fieldname: "bairro", label: "Bairro", fieldtype: "Data", section: "Endereço" },
  { fieldname: "cidade", label: "Cidade", fieldtype: "Data", section: "Endereço" },
  { fieldname: "estado", label: "Estado", fieldtype: "Data", section: "Endereço" },
];

export default function NovoCliente() {
  return (
    <div className="flex justify-center items-start min-h-screen py-8 px-8">
      <FormComponent 
        doctype="Cliente" 
        fields={clienteFields}
        title="Criar Cliente"
        subtitle="Preencha os dados abaixo para cadastrar um novo cliente no sistema"
      />
    </div>
  );
}
