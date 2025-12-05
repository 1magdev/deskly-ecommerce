import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormInput } from "@/components/shared/FormInput";
import { FormInputMask } from "@/components/shared/FormInputMask";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
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
}

interface FormData {
  fullname: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const INITIAL_FORM_DATA: FormData = {
  fullname: "",
  email: "",
  cpf: "",
  password: "",
  confirmPassword: "",
  role: "ADMIN",
};

export function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEditing && id) {
      loadUser(parseInt(id));
    }
  }, [id, isEditing]);

  const loadUser = async (userId: number) => {
    try {
      setLoading(true);
      const user = await userService.getUserById(userId);

      // Bloqueia edição de clientes (CUSTOMER) no backoffice — restaura comportamento anterior
      if (user.role === "CUSTOMER") {
        toast.error("Usuários do tipo CUSTOMER não podem ser editados no backoffice");
        navigate("/backoffice/users");
        return;
      }

      setFormData({
        fullname: user.fullname,
        email: user.email,
        cpf: user.cpf,
        password: "",
        confirmPassword: "",
        role: user.role === "ADMIN" || user.role === "BACKOFFICE" ? user.role : "ADMIN",
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

    if (formData.role === "CUSTOMER") {
      newErrors.role = "CUSTOMER não é permitido no backoffice";
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
          role: formData.role,
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
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
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
            <div className="space-y-4">
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
            </div>

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
