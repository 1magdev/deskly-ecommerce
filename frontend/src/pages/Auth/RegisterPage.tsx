import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cepService } from "@/services/cep.service";
import { handleApiError } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/shared/FormInput";
import { FormInputMask } from "@/components/shared/FormInputMask";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AddressCreateRequest } from "@/types/api.types";

interface PersonalFormData {
  fullname: string;
  email: string;
  cpf: string;
  gender?: string;
  birthDate?: string;
  password: string;
  confirmPassword: string;
}

interface AddressFormData extends Omit<AddressCreateRequest, 'deliveryAddress'> {
  deliveryAddress: boolean;
  paymentAddress: boolean;
  
}

type Step = 'personal' | 'address';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCep, setLoadingCep] = useState<Record<number, boolean>>({});

  const [personalData, setPersonalData] = useState<PersonalFormData>({
    fullname: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });

  const [addresses, setAddresses] = useState<AddressFormData[]>([
    {
      label: "Casa",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      zipCode: "",
      deliveryAddress: true,
      paymentAddress: true,
    }
  ]);

  const handlePersonalChange = (field: keyof PersonalFormData, value: string) => {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddressChange = (index: number, field: keyof AddressFormData, value: string | boolean) => {
    setAddresses((prev) => {
      const newAddresses = [...prev];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      return newAddresses;
    });
  };

  const handleAddAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        label: `Endereço ${prev.length + 1}`,
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        zipCode: "",
        deliveryAddress: false,
        paymentAddress: false,
      }
    ]);
  };

  const handleRemoveAddress = (index: number) => {
    if (addresses.length === 1) {
      toast.error("Você precisa ter pelo menos um endereço");
      return;
    }
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryAddress = (index: number) => {
    setAddresses((prev) =>
      prev.map((addr, i) => ({
        ...addr,
        deliveryAddress: i === index,
      }))
    );
  };


  const handleCheck= (index: number, field: keyof AddressFormData) => {
    setAddresses((prev) => {
      const newAddresses = [...prev];
      newAddresses[index] = { ...newAddresses[index], [field]: !newAddresses[index][field] };
      return newAddresses;
    });
  };



  const handleSetPaymentsAddress = (index: number) => {
    setAddresses((prev) =>
      prev.map((addr, i) => ({
        ...addr,
        paymentAddress: i === index,
      }))
    );
  };

  const handleCepBlur = async (index: number) => {
    const cep = addresses[index].zipCode;
    if (!cep || cep.replace(/\D/g, "").length !== 8) return;

    try {
      setLoadingCep((prev) => ({ ...prev, [index]: true }));
      const data = await cepService.buscarCEP(cep);

      if (data) {
        setAddresses((prev) => {
          const newAddresses = [...prev];
          newAddresses[index] = {
            ...newAddresses[index],
            street: data.logradouro,
            district: data.bairro,
            city: data.localidade,
            state: data.uf,
            complement: data.complemento || newAddresses[index].complement,
          };
          return newAddresses;
        });
        toast.success("CEP encontrado! Endereço preenchido automaticamente.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao buscar CEP");
    } finally {
      setLoadingCep((prev) => ({ ...prev, [index]: false }));
    }
  };

  const validatePersonalData = (): boolean => {
    const errors: Record<string, string> = {};

    if (!personalData.fullname.trim() || personalData.fullname.length < 4) {
      errors.fullname = "Nome deve ter no mínimo 4 caracteres";
    }

    if (!personalData.email.trim()) {
      errors.email = "Email é obrigatório";
    }

    if (!personalData.cpf.trim()) {
      errors.cpf = "CPF é obrigatório";
    }

    if (!personalData.password) {
      errors.password = "Senha é obrigatória";
    }

    if (personalData.password !== personalData.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddresses = (): boolean => {
    const hasValidAddress = addresses.some(
      (addr) => addr.street && addr.number && addr.district && addr.city && addr.state && addr.zipCode
    );

    if (!hasValidAddress) {
      toast.error("Você precisa cadastrar pelo menos um endereço completo");
      return false;
    }

    const hasPrimaryAddress = addresses.some((addr) => addr.deliveryAddress);
    if (!hasPrimaryAddress) {
      toast.error("Você precisa definir um endereço como principal");
      return false;
    }


    const hasPaymentAddress = addresses.some((addr) => addr.paymentAddress);
    if (!hasPaymentAddress) {
      toast.error("Você precisa definir um endereço como faturamento");
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    setError("");

    if (currentStep === 'personal') {
      if (!validatePersonalData()) {
        setError("Por favor, corrija os erros no formulário");
        return;
      }
      setCurrentStep('address');
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep('personal');
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateAddresses()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Preparar endereços válidos
      const validAddresses = addresses.filter(
        (addr) => addr.street && addr.number && addr.district && addr.city && addr.state && addr.zipCode
      ).map(address => ({
        label: address.label,
        street: address.street,
        number: address.number,
        complement: address.complement || "",
        district: address.district,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode.replace(/\D/g, ""),
        deliveryAddress: address.deliveryAddress,
        paymentAddress: address.paymentAddress,
      }));

      // Registrar usuário com endereços em uma única chamada
      await register({
        fullname: personalData.fullname,
        email: personalData.email,
        cpf: personalData.cpf.replace(/\D/g, ""),
        gender: personalData.gender,
        birthDate: personalData.birthDate,
        password: personalData.password,
        confirmPassword: personalData.confirmPassword,
        role: "CUSTOMER",
        addresses: validAddresses,
      });

      toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
      navigate("/login");
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
    } finally {
      setIsSubmitting(false);
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
            {currentStep === 'personal'
              ? 'Preencha seus dados pessoais'
              : 'Cadastre seus endereços de entrega'}
          </CardDescription>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className={`flex items-center gap-2 ${currentStep === 'personal' ? 'text-primary' : 'text-green-600'}`}>
              {currentStep === 'address' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white text-xs">1</div>
              )}
              <span className="text-sm font-medium">Dados Pessoais</span>
            </div>
            <div className="h-px w-12 bg-gray-300" />
            <div className={`flex items-center gap-2 ${currentStep === 'address' ? 'text-primary' : 'text-gray-400'}`}>
              <div className="h-5 w-5 rounded-full bg-current flex items-center justify-center text-white text-xs">2</div>
              <span className="text-sm font-medium">Endereços</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 'personal' && (
              <div className="space-y-4">
                <FormInput
                  label="Nome Completo"
                  value={personalData.fullname}
                  onChange={(e) => handlePersonalChange("fullname", e.target.value)}
                  error={validationErrors.fullname}
                  disabled={isLoading}
                  required
                />

                <FormInput
                  label="Email"
                  type="email"
                  value={personalData.email}
                  onChange={(e) => handlePersonalChange("email", e.target.value)}
                  error={validationErrors.email}
                  disabled={isLoading}
                  required
                />

                <FormInputMask
                  label="CPF"
                  mask="999.999.999-99"
                  value={personalData.cpf}
                  onChange={(e) => handlePersonalChange("cpf", e.target.value)}
                  error={validationErrors.cpf}
                  disabled={isLoading}
                  required
                />

                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <select
                    id="gender"
                    value={personalData.gender || ""}
                    onChange={(e) => handlePersonalChange("gender", e.target.value)}
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
                  value={personalData.birthDate}
                  onChange={(e) => handlePersonalChange("birthDate", e.target.value)}
                  error={validationErrors.birthDate}
                  disabled={isLoading}
                />

                <FormInput
                  label="Senha"
                  type="password"
                  value={personalData.password}
                  onChange={(e) => handlePersonalChange("password", e.target.value)}
                  error={validationErrors.password}
                  disabled={isLoading}
                  required
                />

                <FormInput
                  label="Confirmar Senha"
                  type="password"
                  value={personalData.confirmPassword}
                  onChange={(e) => handlePersonalChange("confirmPassword", e.target.value)}
                  error={validationErrors.confirmPassword}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {currentStep === 'address' && (
              <div className="space-y-6">
                {addresses.map((address, index) => (
                  <Card key={index} className={`p-4 ${address.deliveryAddress ? 'border-primary border-2' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FormInput
                          label=""
                          value={address.label}
                          onChange={(e) => handleAddressChange(index, "label", e.target.value)}
                          placeholder="Ex: Casa, Trabalho"
                          className="font-semibold"
                        />
                        {address.deliveryAddress && (
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded">Principal</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!address.deliveryAddress && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPrimaryAddress(index)}
                          >
                            Definir como principal
                          </Button>
                        )}
               
                         {address.paymentAddress && (
                          <span className="text-xs bg-green text-white px-2 py-1 rounded">Pagamento</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!address.paymentAddress && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPrimaryAddress(index)}
                          >
                            Definir como faturamento
                          </Button>
                        )}
                        {addresses.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveAddress(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInputMask
                        label="CEP"
                        mask="99999-999"
                        value={address.zipCode}
                        onChange={(e) => handleAddressChange(index, "zipCode", e.target.value)}
                        onBlur={() => handleCepBlur(index)}
                        disabled={loadingCep[index]}
                        required
                      />

                      <FormInput
                        label="Rua"
                        value={address.street}
                        onChange={(e) => handleAddressChange(index, "street", e.target.value)}
                        disabled={loadingCep[index]}
                        required
                      />

                      <FormInput
                        label="Número"
                        value={address.number}
                        onChange={(e) => handleAddressChange(index, "number", e.target.value)}
                        disabled={loadingCep[index]}
                        required
                      />

                      <FormInput
                        label="Complemento"
                        value={address.complement}
                        onChange={(e) => handleAddressChange(index, "complement", e.target.value)}
                        disabled={loadingCep[index]}
                      />

                      <FormInput
                        label="Bairro"
                        value={address.district}
                        onChange={(e) => handleAddressChange(index, "district", e.target.value)}
                        disabled={loadingCep[index]}
                        required
                      />

                      <FormInput
                        label="Cidade"
                        value={address.city}
                        onChange={(e) => handleAddressChange(index, "city", e.target.value)}
                        disabled={loadingCep[index]}
                        required
                      />

                      <FormInput
                        label="Estado"
                        value={address.state}
                        onChange={(e) => handleAddressChange(index, "state", e.target.value)}
                        maxLength={2}
                        disabled={loadingCep[index]}
                        required
                      />

<label className="m-2">
            <input
              type="checkbox"
              onChange={() => handleCheck(index, 'paymentAddress')}
              
              checked={address.paymentAddress}
            />
            Endereço de pagamento
          </label>
                    </div>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAddress}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar outro endereço
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4">
              {currentStep === 'personal' ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-primary"
                  disabled={isLoading}
                >
                  Próximo
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Finalizar Cadastro"
                    )}
                  </Button>
                </div>
              )}

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
