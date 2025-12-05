import { useNavigate } from "react-router-dom";
import { Package, Users, LogOut, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
} from "../ui/sidebar";

interface UserData {
  name?: string;
  role?: string;
}

export function BackofficeTabs(userData: UserData) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/backoffice/");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "BACKOFFICE":
        return "Estoquista";
      case "CUSTOMER":
        return "Cliente";
      default:
        return role;
    }
  };

  return (
    <Sidebar className="bg-black">
      <SidebarHeader className="flex flex-row items-center justify-between text-white p-4">
        <div>
          <h2 className="text-lg font-semibold">{userData.name}</h2>
          <p className="text-sm text-gray-400">{getRoleLabel(userData.role || "")}</p>
        </div>
        <SidebarTrigger className="text-white hover:text-white" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/backoffice/products")}
                  className="text-white hover:bg-gray-800"
                >
                  <Package className="h-4 w-4" />
                  <span>Produtos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/backoffice/orders")}
                  className="text-white hover:bg-gray-800"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Pedidos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/backoffice/users")}
                  className="text-white hover:bg-gray-800"
                >
                  <Users className="h-4 w-4" />
                  <span>Usuários</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
