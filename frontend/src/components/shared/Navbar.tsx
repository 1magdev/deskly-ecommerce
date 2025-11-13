import {
  faCartShopping,
  faList,
  faSearch,
  faUser,
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
            <NavigationMenuTrigger className="font-normal text-xl">
              Produtos
            </NavigationMenuTrigger>
            <NavigationMenuContent className="border-1 border-gray-500/20 !shadow-lg">
              <ul className="bg-white grid gap-3 p-4 w-[200px] ">
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/produtos/pesquisar"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/20 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-primary"
                        />{" "}
                        Pesquisar
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/produtos/categorias"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/20  hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        <FontAwesomeIcon
                          icon={faList}
                          className="text-primary"
                        />{" "}
                        Categorias
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to="/carrinho"
                className="text-2xl p-2 h-12 w-12 text-primary rounded-full inline-flex items-center justify-center hover:border-1 hover:bg-primary/25 hover:border-primary/80 transition-all transition-.5s relative"
              >
                <FontAwesomeIcon icon={faCartShopping} className="" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                to={isAuthenticated ? "/perfil" : "/login"}
                className="text-2xl p-2 h-12 w-12 text-primary rounded-full inline-flex items-center justify-center hover:border-1 hover:bg-primary/25 hover:border-primary/80 transition-all transition-.5s"
              >
                <FontAwesomeIcon icon={faUser} className="" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}
