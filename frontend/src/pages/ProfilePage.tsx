import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { addressService } from "@/services/address.service";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { User, Address } from "@/types/api.types";
import { toast } from "sonner";
import {
  Loader2,
  ShoppingCart,
  LogOut,
  User as UserIcon,
  Mail,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Plus,
  Edit,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<boolean | Address>(false);
  const [editingAddress, setEditingAddress] = useState<Address | boolean>(
    false
  );
  const [loadingAddress, setLoadingAddress] = useState(true);
  const updateField = (field: keyof Address, value: any) => {
    if (typeof editingAddress !== "boolean" && editingAddress) {
      setEditingAddress({
        ...editingAddress,
        [field]: value,
      });
    } else if (typeof newAddress !== "boolean") {
      setNewAddress({
        ...newAddress,
        [field]: value,
      });
    }
  };

  const handleFetchCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    updateField("zipCode", cep);

    if (cleanCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (!data.erro) {
        if (typeof editingAddress !== "boolean" && editingAddress) {
          setEditingAddress({
            ...editingAddress,
            street: data.logradouro || "",
            district: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          });
        } else if (typeof newAddress !== "boolean") {
          setNewAddress({
            ...newAddress,
            street: data.logradouro || "",
            district: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          });
        }
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadUserProfile();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (addresses.length > 0) {
      setLoadingAddress(false);
    }
  }, [addresses]);
  const fetchAddresses = async () => {
    try {
      const addressesData = await addressService.getMyAddresses();
      setAddresses(addressesData);
    } catch (err) {
      console.error("Erro ao carregar endereços:", err);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Usa serviço que chama /users/profile — backend resolve usuário ou cliente pelo token
      const userData = await userService.getUserProfile();
      setUser(userData);
      await fetchAddresses();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar perfil"
      );
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(false);
    setNewAddress({
      label: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      deliveryAddress: false,
    } as Address);
  };

  const handleEditAddress = (address: Address) => {
    setNewAddress(false);
    setEditingAddress(address);
  };

  const handleCancelEdit = () => {
    setEditingAddress(false);
    setNewAddress(false);
  };

  const handleSubmit = async (type: "insert" | "edit") => {
    setLoadingAddress(true);
    switch (type) {
      case "insert":
        if (typeof newAddress === "boolean") return;

        try {
          await addressService.createAddress(newAddress);
          toast.success("Endereço criado com sucesso!");
          setNewAddress(false);
          await fetchAddresses();
        } catch (err) {
          console.error(err);
          toast.error("Erro ao criar endereço.");
        }
        break;
      case "edit":
        if (typeof editingAddress === "boolean") return;

        try {
          await addressService.updateAddress(editingAddress.id, editingAddress);
          toast.success("Endereço atualizado com sucesso!");
          setEditingAddress(false);
          await fetchAddresses();
        } catch (err) {
          console.error(err);
          toast.error("Erro ao atualizar endereço.");
        }
        break;
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const handleGoToCart = () => {
    navigate("/carrinho");
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8 px-4 mt-20">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!user) {
    return null;
  }

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-gray-900 font-medium break-words">
          {value || <span className="text-gray-400 italic">Não informado</span>}
        </p>
      </div>
    </div>
  );

  const renderAddressForm = (address: Address, isEditing: boolean) => {
    const currentAddress = isEditing ? editingAddress : newAddress;
    if (typeof currentAddress === "boolean") return null;

    return (
      <div
        className={`p-4 rounded-lg border-2 ${
          isEditing
            ? "border-orange-500 bg-orange-50"
            : "border-primary bg-primary/5"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MapPin
              className={`h-5 w-5 ${
                isEditing ? "text-orange-500" : "text-primary"
              }`}
            />
            {isEditing && <span className="text-orange-600">Editando: </span>}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none font-semibold`}
              placeholder="Rótulo"
              value={currentAddress.label}
              onChange={(e) => updateField("label", e.target.value)}
            />
          </h3>
          <label className="m-2">
            <input
              type="checkbox"
              checked={currentAddress.deliveryAddress}
              onChange={() =>
                updateField("deliveryAddress", !currentAddress.deliveryAddress)
              }
            />
            Endereço de entrega
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="text-gray-700">
            <span className="font-medium">CEP:</span>{" "}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-2`}
              placeholder="CEP"
              value={currentAddress.zipCode}
              onChange={(e) => handleFetchCEP(e.target.value)}
            />
          </div>

          <div className="text-gray-700">
            <span className="font-medium">Cidade/UF:</span>{" "}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-2 w-24`}
              placeholder="Cidade"
              value={currentAddress.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
            /
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-1 w-12`}
              placeholder="UF"
              maxLength={2}
              value={currentAddress.state}
              onChange={(e) =>
                updateField("state", e.target.value.toUpperCase())
              }
            />
          </div>

          <div className="text-gray-700 md:col-span-2">
            <span className="font-medium">Endereço:</span>{" "}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-2 w-64`}
              placeholder="Rua"
              value={currentAddress.street}
              onChange={(e) => updateField("street", e.target.value)}
            />
            ,
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none w-20 ml-1`}
              placeholder="Nº"
              value={currentAddress.number}
              onChange={(e) => updateField("number", e.target.value)}
            />
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none w-40 ml-1`}
              placeholder="Complemento"
              value={currentAddress.complement || ""}
              onChange={(e) => updateField("complement", e.target.value)}
            />
          </div>

          <div className="text-gray-700">
            <span className="font-medium">Bairro:</span>{" "}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-2`}
              placeholder="Bairro"
              value={currentAddress.district}
              onChange={(e) => updateField("district", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="ghost"
            className={`border-2 ${
              isEditing
                ? "border-orange-500 text-orange-600 hover:bg-orange-500"
                : "border-primary text-primary hover:bg-primary"
            } hover:text-white`}
            onClick={() => handleSubmit(isEditing ? "edit" : "insert")}
          >
            {isEditing ? (
              <Edit className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isEditing ? "Salvar Alterações" : "Salvar Endereço"}
          </Button>
          <Button
            variant="outline"
            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-600 hover:text-white  hover:border-gray-600"
            onClick={handleCancelEdit}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-5xl mt-20">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white mb-4 shadow-lg">
              <UserIcon className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {user.fullname}
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card className="border-1 border-primary overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white">
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={UserIcon}
                    label="Nome Completo"
                    value={user.fullname}
                  />
                  <InfoItem icon={Mail} label="Email" value={user.email} />
                  <InfoItem icon={CreditCard} label="CPF" value={user.cpf} />

                  <InfoItem
                    icon={Users}
                    label="Gênero"
                    value={user.gender || ""}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Data de Nascimento"
                    value={
                      user.birthDate
                        ? new Date(user.birthDate).toLocaleDateString("pt-BR")
                        : ""
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {!loadingAddress && addresses.length > 0 ? (
              <Card className="border-1 border-primary overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Meus Endereços ({addresses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <Button variant="default" onClick={handleAddAddress}>
                      <Plus /> Adicionar novo endereço
                    </Button>

                    {newAddress &&
                      typeof newAddress !== "boolean" &&
                      renderAddressForm(newAddress, false)}

                    {addresses.map((address) => {
                      const isEditing =
                        typeof editingAddress !== "boolean" &&
                        editingAddress &&
                        editingAddress.id === address.id;

                      if (isEditing && typeof editingAddress !== "boolean") {
                        return (
                          <div key={address.id}>
                            {renderAddressForm(editingAddress, true)}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={address.id}
                          className={`p-4 rounded-lg border-2 ${
                            address.deliveryAddress
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-primary" />
                              {address.label}
                            </h3>
                            {address.deliveryAddress && (
                              <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                Principal
                              </span>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <p className="text-gray-700">
                              <span className="font-medium">CEP:</span>{" "}
                              {address.zipCode}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Cidade/UF:</span>{" "}
                              {address.city}/{address.state}
                            </p>
                            <p className="text-gray-700 md:col-span-2">
                              <span className="font-medium">Endereço:</span>{" "}
                              {address.street}, {address.number}
                              {address.complement && ` - ${address.complement}`}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Bairro:</span>{" "}
                              {address.district}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            className="border-2 border-primary mt-2 text-primary hover:bg-primary hover:text-white"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit /> Editar
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-1 border-primary overflow-hidden">
                <CardContent className="pt-6">
                  <Skeleton className="h-25 full-w mb-3"></Skeleton>
                  <Skeleton className="h-25 full-w mb-3"></Skeleton>
                  <Skeleton className="h-25 full-w"></Skeleton>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGoToCart}
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white transition-all"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Ir para o Carrinho
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 border-2 text-red-600 border-red-600 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
              size="lg"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
