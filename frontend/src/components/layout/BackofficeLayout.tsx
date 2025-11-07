import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { BackofficeTabs } from "../backoffice/BackofficeTabs";
import type { User as UserType } from "@/types/api.types";

interface BackofficeLayoutProps {
  children: ReactNode;
}

export function BackofficeLayout({ children }: BackofficeLayoutProps) {
  const { userEmail, userRole } = useAuth();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getUserProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <SidebarProvider>
      <BackofficeTabs
        name={userProfile?.fullname || userEmail || ""}
        role={userProfile?.role || userRole || ""}
      />
      <SidebarInset>
        <header className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <SidebarTrigger />
                <h1 className="text-xl font-bold">Deskly - Gerenciamento</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
