import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/api.types";
import { toast } from "sonner";
import {
  Loader2,
  ShoppingCart,
  LogOut,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Users,
} from "lucide-react";

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadUserProfile();
  }, [isAuthenticated, navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserProfile();
      setUser(userData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar perfil"
      );
      navigate("/");
    } finally {
      setLoading(false);
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

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-5xl mt-20">
          {/* Header com Avatar */}
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

          {/* Cards de Informações */}
          <div className="grid gap-6 mb-8">
            {/* Dados Pessoais */}
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
                    icon={Phone}
                    label="Telefone"
                    value={user.phone || ""}
                  />
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

            {/* Endereço */}
            {(user.addressZipcode || user.addressStreet) && (
              <Card className="border-1 border-primary overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-success to-success/90 text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <InfoItem
                      icon={MapPin}
                      label="CEP"
                      value={user.addressZipcode || ""}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoItem
                        icon={MapPin}
                        label="Rua"
                        value={user.addressStreet || ""}
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Número"
                        value={user.addressNumber || ""}
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Complemento"
                        value={user.addressComplement || ""}
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Bairro"
                        value={user.addressNeighborhood || ""}
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Cidade"
                        value={user.addressCity || ""}
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Estado"
                        value={user.addressState || ""}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagamento */}
            {(user.cardLastDigits || user.cardHolderName) && (
              <Card className="border-1 border-primary overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Informações de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoItem
                      icon={CreditCard}
                      label="Nome no Cartão"
                      value={user.cardHolderName || ""}
                    />
                    <InfoItem
                      icon={CreditCard}
                      label="Últimos 4 Dígitos"
                      value={
                        user.cardLastDigits ? `•••• ${user.cardLastDigits}` : ""
                      }
                    />
                    <InfoItem
                      icon={CreditCard}
                      label="Bandeira"
                      value={user.cardBrand || ""}
                    />
                    <InfoItem
                      icon={Calendar}
                      label="Validade"
                      value={user.cardExpiration || ""}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Botões de Ação */}
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
