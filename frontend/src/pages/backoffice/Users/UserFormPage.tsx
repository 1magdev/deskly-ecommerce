import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormInput } from "@/components/shared/FormInput";
import { FormInputMask } from "@/components/shared/FormInputMask";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userService } from "@/services/user.service";
import { cepService } from "@/services/cep.service";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
} from "@/types/api.types";
import { toast } from "sonner";

interface FormErrors {
  fullname?: string;
  email?: string;
  cpf?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  addressZipcode?: string;
  cardLastDigits?: string;
  cardExpiration?: string;
}

interface FormData {
  fullname: string;
  email: string;
  cpf: string;
  gender?: string;
  birthDate?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  cardHolderName?: string;
  cardLastDigits?: string;
  cardBrand?: string;
  cardExpiration?: string;
  phone?: string;
}

const INITIAL_FORM_DATA: FormData = {
  fullname: "",
  email: "",
  cpf: "",
  password: "",
  confirmPassword: "",
  role: "CUSTOMER",
};

export function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState("personal");
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadUser(parseInt(id));
    }
  }, [id, isEditing]);

  const loadUser = async (userId: number) => {
    try {
      setLoading(true);
      const user = await userService.getUserById(userId);
      setFormData({
        fullname: user.fullname,
        email: user.email,
        cpf: user.cpf,
        gender: user.gender,
        birthDate: user.birthDate,
        password: "",
        confirmPassword: "",
        role: user.role,
        addressStreet: user.addressStreet,
        addressNumber: user.addressNumber,
        addressComplement: user.addressComplement,
        addressNeighborhood: user.addressNeighborhood,
        addressCity: user.addressCity,
        addressState: user.addressState,
        addressZipcode: user.addressZipcode,
        cardHolderName: user.cardHolderName,
        cardLastDigits: user.cardLastDigits,
        cardBrand: user.cardBrand,
        cardExpiration: user.cardExpiration,
        phone: user.phone,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar usuário"
      );
      navigate("/backoffice/users");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Nome é obrigatório";
    } else if (formData.fullname.length < 4) {
      newErrors.fullname = "Nome deve ter no mínimo 4 caracteres";
    }

    if (!isEditing && !formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirmação de senha é obrigatória";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem";
      }
    } else {
      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem";
      }
    }

    if (!formData.role) {
      newErrors.role = "Role é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        const updateData: UpdateUserRequest = {
          fullname: formData.fullname,
          cpf: formData.cpf?.replace(/\D/g, ""), // Remove formatação do CPF
          gender: formData.gender,
          birthDate: formData.birthDate,
          role: formData.role,
          addressStreet: formData.addressStreet,
          addressNumber: formData.addressNumber,
          addressComplement: formData.addressComplement,
          addressNeighborhood: formData.addressNeighborhood,
          addressCity: formData.addressCity,
          addressState: formData.addressState,
          addressZipcode: formData.addressZipcode?.replace(/\D/g, ""), // Remove formatação do CEP
          cardHolderName: formData.cardHolderName,
          cardLastDigits: formData.cardLastDigits?.replace(/\D/g, ""), // Remove formatação dos dígitos
          cardBrand: formData.cardBrand,
          cardExpiration: formData.cardExpiration?.replace(/\D/g, ""), // Remove formatação da validade
          phone: formData.phone?.replace(/\D/g, ""), // Remove formatação do telefone
        };

        if (formData.password) {
          updateData.password = formData.password;
          updateData.confirmPassword = formData.confirmPassword;
        }

        await userService.updateUser(parseInt(id), updateData);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        const createData: CreateUserRequest = {
          fullname: formData.fullname,
          email: formData.email,
          cpf: formData.cpf.replace(/\D/g, ""), // Remove formatação do CPF
          gender: formData.gender,
          birthDate: formData.birthDate,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
          addressStreet: formData.addressStreet,
          addressNumber: formData.addressNumber,
          addressComplement: formData.addressComplement,
          addressNeighborhood: formData.addressNeighborhood,
          addressCity: formData.addressCity,
          addressState: formData.addressState,
          addressZipcode: formData.addressZipcode?.replace(/\D/g, ""), // Remove formatação do CEP
          cardHolderName: formData.cardHolderName,
          cardLastDigits: formData.cardLastDigits?.replace(/\D/g, ""), // Remove formatação dos dígitos
          cardBrand: formData.cardBrand,
          cardExpiration: formData.cardExpiration?.replace(/\D/g, ""), // Remove formatação da validade
          phone: formData.phone?.replace(/\D/g, ""), // Remove formatação do telefone
        };
        await userService.createUser(createData);
        toast.success("Usuário cadastrado com sucesso!");
      }
      navigate("/backoffice/users");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar usuário"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.addressZipcode;
    if (!cep || cep.replace(/\D/g, "").length !== 8) return;

    try {
      setLoadingCep(true);
      const data = await cepService.buscarCEP(cep);

      if (data) {
        setFormData((prev) => ({
          ...prev,
          addressStreet: data.logradouro,
          addressNeighborhood: data.bairro,
          addressCity: data.localidade,
          addressState: data.uf,
        }));
        toast.success("CEP encontrado!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao buscar CEP"
      );
    } finally {
      setLoadingCep(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <PageHeader title={isEditing ? "Editar Usuário" : "Novo Usuário"} />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="payment">Pagamento</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nome Completo"
                    value={formData.fullname}
                    onChange={(e) => handleChange("fullname", e.target.value)}
                    error={errors.fullname}
                    required
                  />

                  <FormInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    disabled={isEditing}
                    required={!isEditing}
                  />

                  <FormInputMask
                    label="CPF"
                    mask="999.999.999-99"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    error={errors.cpf}
                    required
                  />

                  <FormInputMask
                    label="Telefone"
                    mask="(99) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    error={errors.phone}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Gênero
                    </label>
                    <select
                      value={formData.gender || ""}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <FormInput
                    label="Data de Nascimento"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                    error={errors.birthDate}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Cargo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        handleChange("role", e.target.value as UserRole)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.role ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="CUSTOMER">Cliente</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="BACKOFFICE">Estoquista</option>
                    </select>
                    {errors.role && (
                      <p className="text-sm text-red-500">{errors.role}</p>
                    )}
                  </div>

                  <FormInput
                    label="Senha"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    error={errors.password}
                    required={!isEditing}
                  />

                  <FormInput
                    label="Confirmar Senha"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    error={errors.confirmPassword}
                    required={!isEditing}
                  />
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInputMask
                    label="CEP"
                    mask="99999-999"
                    value={formData.addressZipcode}
                    onChange={(e) =>
                      handleChange("addressZipcode", e.target.value)
                    }
                    onBlur={handleCepBlur}
                    error={errors.addressZipcode}
                    disabled={loadingCep}
                  />

                  <FormInput
                    label="Rua"
                    value={formData.addressStreet}
                    onChange={(e) =>
                      handleChange("addressStreet", e.target.value)
                    }
                  />

                  <FormInput
                    label="Número"
                    value={formData.addressNumber}
                    onChange={(e) =>
                      handleChange("addressNumber", e.target.value)
                    }
                  />

                  <FormInput
                    label="Complemento"
                    value={formData.addressComplement}
                    onChange={(e) =>
                      handleChange("addressComplement", e.target.value)
                    }
                  />

                  <FormInput
                    label="Bairro"
                    value={formData.addressNeighborhood}
                    onChange={(e) =>
                      handleChange("addressNeighborhood", e.target.value)
                    }
                  />

                  <FormInput
                    label="Cidade"
                    value={formData.addressCity}
                    onChange={(e) =>
                      handleChange("addressCity", e.target.value)
                    }
                  />

                  <FormInput
                    label="Estado"
                    value={formData.addressState}
                    onChange={(e) =>
                      handleChange("addressState", e.target.value)
                    }
                    maxLength={2}
                  />
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nome no Cartão"
                    value={formData.cardHolderName}
                    onChange={(e) =>
                      handleChange("cardHolderName", e.target.value)
                    }
                  />

                  <FormInputMask
                    label="Últimos 4 Dígitos"
                    mask="9999"
                    value={formData.cardLastDigits}
                    onChange={(e) =>
                      handleChange("cardLastDigits", e.target.value)
                    }
                    error={errors.cardLastDigits}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Bandeira
                    </label>
                    <select
                      value={formData.cardBrand || ""}
                      onChange={(e) =>
                        handleChange("cardBrand", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Selecione</option>
                      <option value="Visa">Visa</option>
                      <option value="MasterCard">MasterCard</option>
                      <option value="Elo">Elo</option>
                      <option value="American Express">American Express</option>
                    </select>
                  </div>

                  <FormInputMask
                    label="Validade (MM/AAAA)"
                    mask="99/9999"
                    value={formData.cardExpiration}
                    onChange={(e) =>
                      handleChange("cardExpiration", e.target.value)
                    }
                    error={errors.cardExpiration}
                    placeholder="12/2025"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/backoffice/users")}
                disabled={loading}
                className="border-success text-success hover:bg-success/10 hover:border-success hover:text-success"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
