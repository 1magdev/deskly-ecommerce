import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/shared/FormInput";
import { FormInputMask } from "@/components/shared/FormInputMask";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
// import { cepService } from "@/services/cep.service";
import { toast } from "sonner";

interface RegisterFormData {
  fullname: string;
  email: string;
  cpf: string;
  gender?: string;
  birthDate?: string;
  password: string;
  confirmPassword: string;
  /*   addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  cardHolderName?: string;
  cardLastDigits?: string;
  cardBrand?: string;
  cardExpiration?: string; */
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState("personal");
  // const [loadingCep, setLoadingCep] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    fullname: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  /* const handleCepBlur = async () => {
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
 */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullname.trim() || formData.fullname.length < 4) {
      errors.fullname = "Nome deve ter no mínimo 4 caracteres";
    }

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório";
    }

    if (!formData.cpf.trim()) {
      errors.cpf = "CPF é obrigatório";
    }

    if (!formData.password) {
      errors.password = "Senha é obrigatória";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Por favor, corrija os erros no formulário");
      return;
    }

    try {
      await register({
        fullname: formData.fullname,
        email: formData.email,
        cpf: formData.cpf.replace(/\D/g, ""), // Remove formatação do CPF
        gender: formData.gender,
        birthDate: formData.birthDate,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "CUSTOMER",
        /*         addressStreet: formData.addressStreet,
        addressNumber: formData.addressNumber,
        addressComplement: formData.addressComplement,
        addressNeighborhood: formData.addressNeighborhood,
        addressCity: formData.addressCity,
        addressState: formData.addressState,
        addressZipcode: formData.addressZipcode?.replace(/\D/g, ""), // Remove formatação do CEP
        cardHolderName: formData.cardHolderName,
        cardLastDigits: formData.cardLastDigits?.replace(/\D/g, ""), // Remove formatação dos dígitos
        cardBrand: formData.cardBrand,
        cardExpiration: formData.cardExpiration?.replace(/\D/g, ""), // Remove formatação da validade */
      });

      toast.success("Cadastro realizado com sucesso! Você já está logado.");
      navigate("/");
    } catch (err) {
      const apiError = handleApiError(err);

      if (apiError.isValidationError() && apiError.validationErrors) {
        setValidationErrors(apiError.validationErrors);
        setError("Por favor, corrija os erros abaixo.");
      } else {
        setError(apiError.message);
      }

      if (import.meta.env.DEV) {
        console.error("Erro no cadastro:", apiError);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Preencha seus dados para se cadastrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col">
              <FormInput
                label="Nome Completo"
                value={formData.fullname}
                onChange={(e) => handleChange("fullname", e.target.value)}
                error={validationErrors.fullname}
                disabled={isLoading}
                required
              />

              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={validationErrors.email}
                disabled={isLoading}
                required
              />

              <FormInputMask
                label="CPF"
                mask="999.999.999-99"
                value={formData.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
                error={validationErrors.cpf}
                disabled={isLoading}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <select
                  id="gender"
                  value={formData.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  disabled={isLoading}
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
                error={validationErrors.birthDate}
                disabled={isLoading}
              />

              <FormInput
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                error={validationErrors.password}
                disabled={isLoading}
                required
              />

              <FormInput
                label="Confirmar Senha"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                error={validationErrors.confirmPassword}
                disabled={isLoading}
                required
              />
            </div>

            {/*               <TabsContent value="address" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInputMask
                    label="CEP"
                    mask="99999-999"
                    value={formData.addressZipcode}
                    onChange={(e) => handleChange("addressZipcode", e.target.value)}
                    onBlur={handleCepBlur}
                    error={validationErrors.addressZipcode}
                    disabled={isLoading || loadingCep}
                  />

                  <FormInput
                    label="Rua"
                    value={formData.addressStreet}
                    onChange={(e) => handleChange("addressStreet", e.target.value)}
                    disabled={isLoading}
                  />

                  <FormInput
                    label="Número"
                    value={formData.addressNumber}
                    onChange={(e) => handleChange("addressNumber", e.target.value)}
                    disabled={isLoading}
                  />

                  <FormInput
                    label="Complemento"
                    value={formData.addressComplement}
                    onChange={(e) => handleChange("addressComplement", e.target.value)}
                    disabled={isLoading}
                  />

                  <FormInput
                    label="Bairro"
                    value={formData.addressNeighborhood}
                    onChange={(e) => handleChange("addressNeighborhood", e.target.value)}
                    disabled={isLoading}
                  />

                  <FormInput
                    label="Cidade"
                    value={formData.addressCity}
                    onChange={(e) => handleChange("addressCity", e.target.value)}
                    disabled={isLoading}
                  />

                  <FormInput
                    label="Estado"
                    value={formData.addressState}
                    onChange={(e) => handleChange("addressState", e.target.value)}
                    disabled={isLoading}
                    maxLength={2}
                  />
                </div>
              </TabsContent> */}

            {/*               <TabsContent value="payment" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nome no Cartão"
                    value={formData.cardHolderName}
                    onChange={(e) => handleChange("cardHolderName", e.target.value)}
                    disabled={isLoading}
                  />

                  <FormInputMask
                    label="Últimos 4 Dígitos"
                    mask="9999"
                    value={formData.cardLastDigits}
                    onChange={(e) => handleChange("cardLastDigits", e.target.value)}
                    error={validationErrors.cardLastDigits}
                    disabled={isLoading}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="cardBrand">Bandeira</Label>
                    <select
                      id="cardBrand"
                      value={formData.cardBrand || ""}
                      onChange={(e) => handleChange("cardBrand", e.target.value)}
                      disabled={isLoading}
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
                    onChange={(e) => handleChange("cardExpiration", e.target.value)}
                    error={validationErrors.cardExpiration}
                    disabled={isLoading}
                    placeholder="12/2025"
                  />
                </div>
              </TabsContent> */}

            <div className="flex flex-col gap-4 pt-4">
              <Button
                type="submit"
                className="w-full bg-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar"
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Já tem uma conta? </span>
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Entrar
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
