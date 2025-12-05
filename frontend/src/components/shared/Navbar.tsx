import {
  faCartShopping,
  faUser,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { getItemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const itemCount = getItemCount();

  return (
    <nav className="z-5 flex px-5 justify-between h-25 border-b border-primary fixed bg-white w-full">
      <img src="/branding/deskly-logo.svg" alt="logo" />

      <NavigationMenu>
        <NavigationMenuList className="flex gap-12 text-xl items-center">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link to="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to="/carrinho"
                className="text-2xl p-2 h-12 w-12 text-primary rounded-full inline-flex items-center justify-center hover:bg-primary/25 transition-all relative"
              >
                <FontAwesomeIcon icon={faCartShopping} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {isAuthenticated && (
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/pedidos"
                  className="text-xl p-2 text-primary inline-flex items-center justify-center hover:bg-primary/25 transition-all"
                  title="Meus Pedidos"
                >
                  <FontAwesomeIcon icon={faBox} className="mr-2" />
                  Meus Pedidos
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to={isAuthenticated ? "/perfil" : "/login"}
                className="text-2xl p-2 h-12 w-12 text-primary rounded-full inline-flex items-center justify-center hover:bg-primary/25 transition-all"
              >
                <FontAwesomeIcon icon={faUser} />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}
